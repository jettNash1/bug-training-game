const CATALOG_KEY = 'quizCatalog';
const MAX_CATEGORY_NAME_LENGTH = 80;

const DEFAULT_QUIZ_CATEGORIES = {
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

const KNOWN_QUIZ_IDS = Object.values(DEFAULT_QUIZ_CATEGORIES).flat();

class CatalogError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'CatalogError';
        this.statusCode = statusCode;
    }
}

function slugify(name) {
    return String(name || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function uniqueSlug(name, existingIds) {
    const base = slugify(name) || 'category';
    let slug = base;
    let suffix = 2;
    while (existingIds.has(slug)) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }
    return slug;
}

function getDefaultCatalog() {
    return {
        categories: Object.entries(DEFAULT_QUIZ_CATEGORIES).map(([name, quizzes]) => ({
            id: slugify(name),
            name,
            quizzes: [...quizzes]
        }))
    };
}

function cloneCatalog(catalog) {
    const rawCategories = catalog?.categories;
    const categories = Array.isArray(rawCategories)
        ? rawCategories
        : (rawCategories && typeof rawCategories === 'object'
            ? Object.keys(rawCategories)
                .sort((a, b) => Number(a) - Number(b))
                .map((key) => rawCategories[key])
                .filter((item) => item && typeof item === 'object')
            : []);
    return {
        categories: categories.map((category) => ({
            id: category.id,
            name: category.name,
            quizzes: Array.isArray(category.quizzes)
                ? [...category.quizzes]
                : (category.quizzes && typeof category.quizzes === 'object'
                    ? Object.keys(category.quizzes)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((key) => category.quizzes[key])
                    : [])
        }))
    };
}

function toPlainCatalog(catalog) {
    return JSON.parse(JSON.stringify(cloneCatalog(catalog)));
}

function normalizeQuizId(quizId) {
    return String(quizId || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeCatalog(catalog) {
    const cloned = cloneCatalog(catalog);
    cloned.categories = cloned.categories.map((category) => ({
        id: slugify(category.id || category.name),
        name: String(category.name || '').trim(),
        quizzes: (category.quizzes || [])
            .map(normalizeQuizId)
            .filter(Boolean)
    }));
    return cloned;
}

function repairCatalog(catalog) {
    const repaired = normalizeCatalog(catalog);
    const seenQuizzes = new Set();

    repaired.categories.forEach((category) => {
        category.quizzes = category.quizzes.filter((quizId) => {
            if (!KNOWN_QUIZ_IDS.includes(quizId) || seenQuizzes.has(quizId)) {
                return false;
            }
            seenQuizzes.add(quizId);
            return true;
        });
    });

    const missing = KNOWN_QUIZ_IDS.filter((quizId) => !seenQuizzes.has(quizId));
    if (missing.length > 0) {
        let uncategorized = repaired.categories.find((category) => category.id === 'uncategorized');
        if (!uncategorized) {
            uncategorized = {
                id: 'uncategorized',
                name: 'Uncategorized',
                quizzes: []
            };
            repaired.categories.push(uncategorized);
        }
        uncategorized.quizzes.push(...missing);
    }

    return repaired;
}

function validateCatalog(catalog) {
    if (!catalog || typeof catalog !== 'object' || !Array.isArray(catalog.categories)) {
        throw new CatalogError('Quiz catalog must include a categories array');
    }

    if (catalog.categories.length === 0) {
        throw new CatalogError('At least one category is required');
    }

    const normalized = normalizeCatalog(catalog);
    const ids = new Set();
    const names = new Set();
    const quizzes = [];

    normalized.categories.forEach((category, index) => {
        if (!category.id) {
            throw new CatalogError(`Category at position ${index + 1} is missing an id`);
        }
        if (ids.has(category.id)) {
            throw new CatalogError(`Duplicate category id: ${category.id}`);
        }
        ids.add(category.id);

        if (!category.name) {
            throw new CatalogError('Category name is required');
        }
        if (category.name.length > MAX_CATEGORY_NAME_LENGTH) {
            throw new CatalogError(`Category name must be ${MAX_CATEGORY_NAME_LENGTH} characters or fewer`);
        }

        const nameKey = category.name.toLowerCase();
        if (names.has(nameKey)) {
            throw new CatalogError(`Duplicate category name: ${category.name}`);
        }
        names.add(nameKey);

        category.quizzes.forEach((quizId) => {
            if (!KNOWN_QUIZ_IDS.includes(quizId)) {
                throw new CatalogError(`Unknown quiz: ${quizId}`);
            }
            if (quizzes.includes(quizId)) {
                throw new CatalogError(`Quiz ${quizId} is assigned to more than one category`);
            }
            quizzes.push(quizId);
        });
    });

    const missing = KNOWN_QUIZ_IDS.filter((quizId) => !quizzes.includes(quizId));
    if (missing.length > 0) {
        throw new CatalogError(`Catalog is missing quizzes: ${missing.join(', ')}`);
    }

    return normalized;
}

function findCategory(catalog, categoryId) {
    return catalog.categories.find((category) => category.id === categoryId) || null;
}

function findQuizLocation(catalog, quizId) {
    const normalizedQuizId = normalizeQuizId(quizId);
    for (const category of catalog.categories) {
        const index = category.quizzes.indexOf(normalizedQuizId);
        if (index !== -1) {
            return { category, index, quizId: normalizedQuizId };
        }
    }
    return null;
}

function moveArrayItem(items, fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= items.length) {
        throw new CatalogError('Invalid item index');
    }
    const boundedTo = Math.max(0, Math.min(toIndex, items.length - 1));
    const [item] = items.splice(fromIndex, 1);
    items.splice(boundedTo, 0, item);
    return items;
}

function createCategory(catalog, name) {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
        throw new CatalogError('Category name is required');
    }
    if (trimmedName.length > MAX_CATEGORY_NAME_LENGTH) {
        throw new CatalogError(`Category name must be ${MAX_CATEGORY_NAME_LENGTH} characters or fewer`);
    }

    const existingNames = new Set(catalog.categories.map((category) => category.name.toLowerCase()));
    if (existingNames.has(trimmedName.toLowerCase())) {
        throw new CatalogError('A category with that name already exists');
    }

    const existingIds = new Set(catalog.categories.map((category) => category.id));
    catalog.categories.push({
        id: uniqueSlug(trimmedName, existingIds),
        name: trimmedName,
        quizzes: []
    });
    return catalog;
}

function renameCategory(catalog, categoryId, name) {
    const category = findCategory(catalog, categoryId);
    if (!category) {
        throw new CatalogError('Category not found', 404);
    }

    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
        throw new CatalogError('Category name is required');
    }
    if (trimmedName.length > MAX_CATEGORY_NAME_LENGTH) {
        throw new CatalogError(`Category name must be ${MAX_CATEGORY_NAME_LENGTH} characters or fewer`);
    }

    const duplicate = catalog.categories.find((item) => (
        item.id !== categoryId && item.name.toLowerCase() === trimmedName.toLowerCase()
    ));
    if (duplicate) {
        throw new CatalogError('A category with that name already exists');
    }

    category.name = trimmedName;
    return catalog;
}

function reorderCategory(catalog, categoryId, index) {
    const fromIndex = catalog.categories.findIndex((category) => category.id === categoryId);
    if (fromIndex === -1) {
        throw new CatalogError('Category not found', 404);
    }
    if (typeof index !== 'number' || !Number.isInteger(index)) {
        throw new CatalogError('Category index must be an integer');
    }
    moveArrayItem(catalog.categories, fromIndex, index);
    return catalog;
}

function deleteCategory(catalog, categoryId, moveQuizzesTo) {
    if (catalog.categories.length <= 1) {
        throw new CatalogError('Cannot delete the last remaining category');
    }

    const category = findCategory(catalog, categoryId);
    if (!category) {
        throw new CatalogError('Category not found', 404);
    }

    if (category.quizzes.length > 0) {
        if (!moveQuizzesTo) {
            throw new CatalogError('Choose a destination category before removing this category');
        }
        if (moveQuizzesTo === categoryId) {
            throw new CatalogError('Destination category must be different from the category being removed');
        }
        const destination = findCategory(catalog, moveQuizzesTo);
        if (!destination) {
            throw new CatalogError('Destination category not found');
        }
        destination.quizzes.push(...category.quizzes);
        category.quizzes = [];
    }

    catalog.categories = catalog.categories.filter((item) => item.id !== categoryId);
    return catalog;
}

function moveQuiz(catalog, quizId, categoryId, index) {
    const location = findQuizLocation(catalog, quizId);
    if (!location) {
        throw new CatalogError('Quiz not found in the catalog', 404);
    }

    const destination = findCategory(catalog, categoryId);
    if (!destination) {
        throw new CatalogError('Destination category not found');
    }

    location.category.quizzes.splice(location.index, 1);

    let destinationIndex = destination.quizzes.length;
    if (typeof index === 'number' && Number.isInteger(index)) {
        destinationIndex = Math.max(0, Math.min(index, destination.quizzes.length));
    }
    destination.quizzes.splice(destinationIndex, 0, location.quizId);
    return catalog;
}

async function getOrCreateCatalog(Setting) {
    let setting = await Setting.findOne({ key: CATALOG_KEY });
    if (!setting) {
        setting = new Setting({
            key: CATALOG_KEY,
            value: getDefaultCatalog(),
            description: 'Quiz category layout and quiz-to-category assignment'
        });
        await setting.save();
        return toPlainCatalog(setting.value);
    }

    const repaired = repairCatalog(setting.value);
    const current = JSON.stringify(normalizeCatalog(setting.value));
    const next = JSON.stringify(repaired);
    if (current !== next) {
        setting.value = repaired;
        setting.markModified('value');
        await setting.save();
    }
    return toPlainCatalog(repaired);
}

async function saveCatalog(Setting, catalog) {
    const validated = validateCatalog(catalog);
    let setting = await Setting.findOne({ key: CATALOG_KEY });
    if (!setting) {
        setting = new Setting({
            key: CATALOG_KEY,
            value: validated,
            description: 'Quiz category layout and quiz-to-category assignment'
        });
    } else {
        setting.value = validated;
        setting.markModified('value');
    }
    const saved = await setting.save();
    return toPlainCatalog(saved.value);
}

module.exports = {
    CATALOG_KEY,
    MAX_CATEGORY_NAME_LENGTH,
    DEFAULT_QUIZ_CATEGORIES,
    KNOWN_QUIZ_IDS,
    CatalogError,
    slugify,
    uniqueSlug,
    getDefaultCatalog,
    cloneCatalog,
    toPlainCatalog,
    normalizeCatalog,
    repairCatalog,
    validateCatalog,
    findCategory,
    findQuizLocation,
    createCategory,
    renameCategory,
    reorderCategory,
    deleteCategory,
    moveQuiz,
    getOrCreateCatalog,
    saveCatalog
};
