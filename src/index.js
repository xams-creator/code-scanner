import fs from 'fs-extra';
import path from 'path';
import { globbySync } from 'globby';

const rc = fs.readJsonSync(path.resolve('./index.config.json'));

// const rc = fs.readJsonSync('./index.config.json');

class Scanner {

    constructor(options) {
        // [{cwd1,extensions1},{cwd2,extensions2}]
        this.options = !Array.isArray(options) ? [options] : options;

        this.statistics = {};
        this.options.forEach((option) => {
            this.initialization(option);
        });
    }

    initialization(option) {
        if (!option.cwd) {
            throw new Error('cwd is not found!');
        }
        option.statistics = {};
        option.extensions.forEach((extension) => {
            option.statistics[extension] = {
                paths: [],
                line: 0,
            };

            this.statistics[extension] = {
                line: 0,
            };
        });
    }

    analyze(option) {
        console.log(`=== start analyze [${option.cwd}] ===`);
        option.extensions.forEach((extension) => {
            option.statistics[extension].paths = globbySync([`**.${extension}`], {
                cwd: option.cwd,
                gitignore: true,
            });
            option.statistics[extension].paths.forEach((p) => {
                option.statistics[extension].line += this.readFileLine(path.join(option.cwd, p));
            });

            this.statistics[extension].line += option.statistics[extension].line;
        });
        console.log(option.statistics);
        console.log(`=== end analyze [${option.cwd}] ===`);
    }

    analyzeAll() {
        this.options.forEach((option) => {
            if (!option.ignored) {
                this.analyze(option);
            }
        });
    }

    readFileLine(path) {
        return fs.readFileSync(path, 'utf-8').split('\n').length;
    }

}

const app = new Scanner(rc);
app.analyzeAll();
console.table(app.statistics);
