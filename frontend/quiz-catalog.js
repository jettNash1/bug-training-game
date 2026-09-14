export const DEFAULT_QUIZ_CATEGORIES = {
    'Core QA Skills': [
        'tester-mindset',
        'communication',
        'time-management'
    ],
    'Test Execution': [
        'test-types-tricks',
        'build-verification',
        'sanity-smoke',
        'locale-testing',
        'exploratory',
        'standard-script-testing',
        'fully-scripted',
        'non-functional',
        'issue-verification',
        'raising-tickets',
        'reports',
        'script-metrics-troubleshooting',
        'test-support',
        'ticket-template'
    ],
    'Project Management': [
        'risk-analysis',
        'risk-management',
        'issue-tracking-tools'
    ],
    'Content Testing': [
        'cms-testing',
        'email-testing',
        'content-copy'
    ],
    'Interviews': [
        'automation-interview',
        'functional-interview',
        'initiative'
    ]
};

export function slugifyCategoryName(name) {
    return String(name || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function getDefaultCatalog() {
    return {
        categories: Object.entries(DEFAULT_QUIZ_CATEGORIES).map(([name, quizzes]) => ({
            id: slugifyCategoryName(name),
            name,
            quizzes: [...quizzes]
        }))
    };
}

export function catalogToMap(catalog) {
    const normalized = normalizeCatalogPayload(catalog);
    const categories = Array.isArray(normalized?.categories) ? normalized.categories : [];
    return categories.reduce((map, category) => {
        if (!category?.name) {
            return map;
        }
        map[category.name] = Array.isArray(category.quizzes) ? [...category.quizzes] : [];
        return map;
    }, {});
}

export function normalizeCatalogPayload(payload) {
    if (!payload) {
        return null;
    }

    let data = payload;
    if (data.categories == null && data.data && typeof data.data === 'object') {
        data = data.data;
    }
    if (data.categories == null && data.data && typeof data.data === 'object') {
        data = data.data;
    }

    if (Array.isArray(data?.categories)) {
        return {
            categories: data.categories.map((category) => ({
                id: category.id || slugifyCategoryName(category.name),
                name: category.name,
                quizzes: Array.isArray(category.quizzes) ? [...category.quizzes] : []
            }))
        };
    }

    if (data?.categories && typeof data.categories === 'object') {
        const list = Object.keys(data.categories)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => data.categories[key])
            .filter((item) => item && typeof item === 'object' && item.name);
        if (list.length > 0) {
            return {
                categories: list.map((category) => ({
                    id: category.id || slugifyCategoryName(category.name),
                    name: category.name,
                    quizzes: Array.isArray(category.quizzes) ? [...category.quizzes] : []
                }))
            };
        }
    }

    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const entries = Object.entries(data).filter(([, quizzes]) => Array.isArray(quizzes));
        if (entries.length > 0) {
            return {
                categories: entries.map(([name, quizzes]) => ({
                    id: slugifyCategoryName(name),
                    name,
                    quizzes: [...quizzes]
                }))
            };
        }
    }

    return null;
}

export function flattenCatalogQuizIds(catalog) {
    const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
    return categories.flatMap((category) => (
        Array.isArray(category.quizzes) ? category.quizzes : []
    ));
}

let cachedCatalog = null;
let cachedMap = null;
let inflightRequest = null;
let cachedFromNetwork = false;

async function resolveApiService(apiService) {
    if (apiService) {
        return apiService;
    }
    const module = await import('./api-service.js');
    return new module.APIService();
}

export function setCachedCatalog(catalog, fromNetwork = false) {
    const normalized = normalizeCatalogPayload(catalog) || getDefaultCatalog();
    cachedCatalog = {
        categories: normalized.categories.map((category) => ({
            id: category.id,
            name: category.name,
            quizzes: Array.isArray(category.quizzes) ? [...category.quizzes] : []
        }))
    };
    cachedMap = catalogToMap(cachedCatalog);
    cachedFromNetwork = fromNetwork && Boolean(normalizeCatalogPayload(catalog));
    return cachedCatalog;
}

export function getCachedCatalog() {
    return cachedCatalog;
}

export function getCachedCategoryMap() {
    return cachedMap || DEFAULT_QUIZ_CATEGORIES;
}

export function invalidateQuizCatalogCache() {
    cachedCatalog = null;
    cachedMap = null;
    inflightRequest = null;
    cachedFromNetwork = false;
}

export async function getQuizCatalog(apiService) {
    if (cachedCatalog && cachedFromNetwork) {
        return cachedCatalog;
    }

    if (inflightRequest) {
        return inflightRequest;
    }

    inflightRequest = (async () => {
        try {
            const service = await resolveApiService(apiService);
            const response = await service.getQuizCatalog();
            const catalog = normalizeCatalogPayload(response?.data) || normalizeCatalogPayload(response);
            if (response?.success !== false && catalog) {
                return setCachedCatalog(catalog, true);
            }
            console.warn('[QuizCatalog] Catalog response was missing categories; using defaults');
        } catch (error) {
            console.warn('[QuizCatalog] Failed to load catalog, using defaults', error);
        } finally {
            inflightRequest = null;
        }

        return getDefaultCatalog();
    })();

    return inflightRequest;
}

export async function getQuizCategories(apiService) {
    const catalog = await getQuizCatalog(apiService);
    return catalogToMap(catalog);
}

export function formatQuizDisplayName(quizId) {
    if (!quizId) {
        return '';
    }

    if (quizId.toLowerCase() === 'cms-testing') {
        return 'CMS Testing (CRUD)';
    }

    return String(quizId)
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
