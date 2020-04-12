import { Lib } from './lib';

class Program {
    static Main(args: string[]) {
        console.log("Hello World");
        new Lib().test();
    }

    static test(): number {
        return 5;
    }
}


Program.Main([]);