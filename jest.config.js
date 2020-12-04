module.exports = {
    moduleFileExtensions: ['js', 'ts', 'json'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    coverageThreshold: {
        // global: {
        //     branches: 50,
        //     functions: 50,
        //     lines: 50,
        //     statements: 50
        // }
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    testPathIgnorePatterns: ['/lib/', '/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverage: true
};
