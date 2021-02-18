I googled what the maximum number value is in JS and found MDN's doc: 
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER

I noticed some rounding errors with .toFixed, and upon a bit of research
it seems to just be a JavaScript issue especially in certain browsers. 
- https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary 