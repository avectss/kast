const chalk = require('chalk').default;
const os = require('os');

function formatBytes(bytes) {
    const mb = bytes / 1024 / 1024;
    return `${Math.round(mb)}MiB`;
}

function showKastNeofetch(client) {
    console.clear();

    const logoLines = [
        "  @@@@@      -@@@@@@@@@@@@@@@@@@@",
        "  @@@        -@@@@@@@@@@@@@@@@@#",
        "  @@         @@@@@@     .@@@@@",
        "         @@@@@        @@@@@",
        "       @@@@@        @@@@@",
        "     @@@@@        @@@@@",
        "   =@@@@:       @@@@@",
        "  @@@@@        @@@@@",
        "   *@@@@        @@@@@",
        "     @@@@@        @@@@@",
        "       @@@@@        @@@@@",
        "         @@@@@        @@@@@",
        "  @-       @@@@@       .@@@@@",
        "  @@@       @@@@@@@@@@@@@@@@@@*",
        "  @@@@@       %@@@@@@@@@@@@@@@@@"
    ];

    const color = '#b084f8'; // Morado
    const gray = '#999999';
    const red = '#ff5c5c';

    const totalMem = formatBytes(os.totalmem());
    const freeMem = formatBytes(os.totalmem() - os.freemem());
    const cpus = os.cpus();
    const cpuModel = cpus[0].model.trim();
    const cpuSpeed = `${cpus[0].speed}MHz`;
    const terminal = process.env.TERM || '/dev/pts/0';
    const platform = `${os.type()} ${os.release()} ${os.arch()}`;
    const shell = process.env.SHELL || 'node.js';
    const kernel = os.version() || os.release();

    const uptimeSeconds = os.uptime();
    const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;

    const infoLines = [
        `${chalk.hex(color)('        root')}${chalk.hex(gray)('@')}${chalk.hex(color)('localhost')}`,
        `${chalk.hex(gray)('        --------------')}`,
        `${chalk.hex(red)('        OS:')}         ${platform}`,
        `${chalk.hex(red)('        Host:')}       NodeJS Virtual Env`,
        `${chalk.hex(red)('        Kernel:')}     ${kernel}`,
        `${chalk.hex(red)('        Uptime:')}     ${uptime}`,
        `${chalk.hex(red)('        Packages:')}   ${client.commands.size} (modules)`,
        `${chalk.hex(red)('        Shell:')}      ${shell}`,
        `${chalk.hex(red)('        Terminal:')}   ${terminal}`,
        `${chalk.hex(red)('        CPU:')}        ${cpuModel} @ ${cpuSpeed}`,
        `${chalk.hex(red)('        Memory:')}     ${freeMem} / ${totalMem}`
    ];

    const maxLines = Math.max(logoLines.length, infoLines.length);

    console.log();
    for (let i = 0; i < maxLines; i++) {
        const logo = chalk.hex(color)(logoLines[i] || '');
        const info = infoLines[i] || '';
        console.log(`${logo.padEnd(60)}   ${info}`);
    }

    console.log('\n' + chalk.hex(color)('──────────────────────────────────────────────────────────────'));
    console.log(chalk.hex(color)('Developed with ❤️ by messlyyy'));
}

module.exports = showKastNeofetch;
