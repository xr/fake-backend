/**
 * Response Payload Generator
 * Generates response payloads matching the expected structure
 */

function generateString(targetSize) {
  if (targetSize <= 0) return "";
  const pattern = "abcdefghijklmnopqrstuvwxyz0123456789";
  const repeats = Math.ceil(targetSize / pattern.length);
  return pattern.repeat(repeats).substring(0, targetSize);
}

function generateResponsePayload(targetSizeBytes) {
  const baseResponse = {
    offset: 10,
    limit: 5,
    total: 20,
    results: [
      {
        name: "Fake Backend Response",
        fileSize: 23333,
        extra: "extra",
      },
      {
        name: "Fake Backend Response 2",
        fileSize: 23333,
        extra: "extra",
      },
    ],
  };

  // Check if base response already exceeds target
  let currentSize = JSON.stringify(baseResponse).length;
  if (currentSize >= targetSizeBytes) {
    return baseResponse;
  }

  // Calculate how much data we need to add
  let remainingSize = targetSizeBytes - currentSize;

  // Add items until we're close to the target, then use padding to hit exact size
  let itemIndex = 3;
  const maxIterations = 10000; // Safety limit
  let iterations = 0;

  while (currentSize < targetSizeBytes && iterations < maxIterations) {
    // Create a test item
    const testItem = {
      name: `Fake Backend Response ${itemIndex}`,
      fileSize: Math.floor(Math.random() * 100000),
      extra: generateString(100),
      metadata: {
        id: itemIndex - 3,
        timestamp: Date.now(),
        data: generateString(200)
      }
    };

    // Actually add it and check the real size
    baseResponse.results.push(testItem);
    baseResponse.total = baseResponse.results.length;
    const newSize = JSON.stringify(baseResponse).length;

    // If we exceeded or are very close to target, remove it and use padding instead
    if (newSize >= targetSizeBytes) {
      baseResponse.results.pop();
      baseResponse.total = baseResponse.results.length;
      break;
    }

    currentSize = newSize;
    itemIndex++;
    iterations++;
  }

  // Now fine-tune to hit exact target size using padding field
  // Recalculate current size after adding items
  currentSize = JSON.stringify(baseResponse).length;
  remainingSize = targetSizeBytes - currentSize;

  if (remainingSize > 0 && baseResponse.results.length > 0) {
    const lastItem = baseResponse.results[baseResponse.results.length - 1];
    
    // Add a padding field and adjust iteratively to hit target size
    // JSON overhead for "padding":"..." is approximately 13 bytes
    let paddingSize = Math.max(0, remainingSize - 13);
    
    // Iteratively adjust padding to get as close as possible to target
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      lastItem.metadata.padding = generateString(paddingSize);
      currentSize = JSON.stringify(baseResponse).length;
      
      if (currentSize === targetSizeBytes) {
        // Perfect match!
        break;
      } else if (currentSize < targetSizeBytes) {
        // Need more padding
        const diff = targetSizeBytes - currentSize;
        paddingSize += diff;
      } else {
        // Too much padding, reduce it
        const diff = currentSize - targetSizeBytes;
        paddingSize = Math.max(0, paddingSize - diff - 1);
        lastItem.metadata.padding = generateString(paddingSize);
        break;
      }
      
      attempts++;
    }
  }

  return baseResponse;
}

function parseSize(sizeStr) {
  const sizeStrLower = sizeStr.toLowerCase().trim();
  const match = sizeStrLower.match(/^(\d+)(kb|mb|gb)?$/);
  
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}. Use format like: 1kb, 10mb, etc.`);
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'b';
  
  const multipliers = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  return value * multipliers[unit];
}

module.exports = { generateResponsePayload, parseSize };
