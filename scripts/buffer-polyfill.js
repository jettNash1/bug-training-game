/**
 * Buffer polyfill for Node.js v24+
 * This polyfill restores SlowBuffer which was removed in Node.js v24
 */

// Only apply polyfill if SlowBuffer is not defined
if (!global.SlowBuffer) {
  console.log('Applying SlowBuffer polyfill for Node.js v24+ compatibility');
  
  // Create a polyfill for the removed SlowBuffer
  global.SlowBuffer = class SlowBuffer extends Buffer {
    constructor(size) {
      super(size);
    }
    
    // Add equal method which buffer-equal-constant-time depends on
    static get prototype() {
      const proto = Object.create(Buffer.prototype);
      
      // Add the equal method that buffer-equal-constant-time expects
      proto.equal = function(otherBuffer) {
        if (!(otherBuffer instanceof Buffer)) {
          return false;
        }
        
        if (this.length !== otherBuffer.length) {
          return false;
        }
        
        // Constant-time equality check
        let equal = 1;
        for (let i = 0; i < this.length; i++) {
          // Use XOR to check equality without early returns
          equal &= (this[i] === otherBuffer[i]) ? 1 : 0;
        }
        
        return equal === 1;
      };
      
      return proto;
    }
  };
  
  // Ensure the constructor works properly
  global.SlowBuffer.prototype = SlowBuffer.prototype;
} 