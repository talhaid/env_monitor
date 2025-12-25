const { cn } = require('./src/lib/utils'); // This might fail due to ES modules if type: module is used or ts files.
// Since it's TS, I can't run it with node directly unless I use ts-node or compile it.
// I'll try to just check if dependencies can be required.

try {
    const clsx = require('clsx');
    console.log('clsx loaded');
    const twMerge = require('tailwind-merge');
    console.log('tailwind-merge loaded');
} catch (e) {
    console.error(e);
}
