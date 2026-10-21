import gradient from 'gradient-string';

const aspenGradient = gradient(['#2ecc71', '#3498db', '#9b59b6']);

export const printBanner = () => {
  console.log(aspenGradient.multiline(`
     /\\
    /  \\     ███████╗██████╗ ███████╗███╗   ██╗
   /    \\    ██╔════╝██╔══██╗██╔════╝████╗  ██║
  /      \\   ███████╗██████╔╝█████╗  ██╔██╗ ██║
 /        \\  ╚════██║██╔═══╝ ██╔══╝  ██║╚██╗██║
/          \\ ███████║██║     ███████╗██║ ╚████║
────────────╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝

  🌲 Modern Backend Project Scaffolding Tool 🌲
`));
};
