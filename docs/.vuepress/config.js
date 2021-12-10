module.exports = {
    locales: {
        '/': {
            title: "Terra Docs",
            description: "Terra is an open source, public blockchain protocol that provides fundamental infrastructure for a decentralized economy and enables open participation in the creation of new financial primitives to power the innovation of money.",
        },
        '/zh/': {
            title: "Terra 文档",
            description: "Terra is an open source, public blockchain protocol that provides fundamental infrastructure for a decentralized economy and enables open participation in the creation of new financial primitives to power the innovation of money.",
        },
        '/ja/': {
            title: "Terra ドキュメント",
            description: "Terra is an open source, public blockchain protocol that provides fundamental infrastructure for a decentralized economy and enables open participation in the creation of new financial primitives to power the innovation of money.",
        }
    },
    markdown: {
        extendMarkdown: (md) => {
            md.use(require("markdown-it-footnote"));
        },
    },
    plugins: [
        [
            "@vuepress/register-components",
            {
                componentsDir: "theme/components",
            },
        ],
        [
            "vuepress-plugin-mathjax",
            {
                target: "svg",
                macros: {
                    "*": "\\times",
                },
            },
        ],
    ],
    head: [
        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://cloud.typography.com/7420256/6416592/css/fonts.css",
            },
        ],
        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://www.terra.money/static/fonts/jetbrainsMono.css?updated=190220"
            },
        ],
        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined",
            },
        ],

        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://fonts.googleapis.com/css?family=Noto+Sans+KR:400,500,700&display=swap",
            },
        ],
        [
            "link",
            {
                rel: "icon",
                type: "image/png",
                href: "/img/favicon.png",
            },
        ],
        [
            "script",
            {},
            `window.onload = function() {
requestAnimationFrame(function() {
    if (location.hash) {
    const element = document.getElementById(location.hash.slice(1))

    if (element) {
        element.scrollIntoView()
    }
    }
})
}`,
        ],
    ],
    themeConfig: {
        locales: {
            '/': {
                selectText: 'Languages',
                label: 'English',
                nav: [
                    { text: "Overview", link: "/" },
                    { text: "Tutorials", link: "/Tutorials/" },
                    { text: "How to", link: "/How-to/" },
                    { text: "Concepts", link: "/Concepts/" },
                    { text: "Reference", link: "/Reference/" },
                    { text: "SDKs", link: "/SDKs/" },
                    {
                        text: "GitHub",
                        link: "https://github.com/terra-money/core",
                        icon: "/img/github.svg",
                    },
                ],
                sidebar: {

                    "/Tutorials/": [
                        "/Tutorials/",
                        {
                            title: "Get started",
                            children: [
                                "/Tutorials/Get-started/Terra-Station-desktop",
                                "/Tutorials/Get-started/Terra-Station-extension",
                                "/Tutorials/Get-started/Terra-Station-mobile",
                            ],
                            collapsable: true,
                        },
                        {
                            title: "Build a simple Terra dApp",
                            children: [
                                "/Tutorials/Smart-contracts/Overview",
                                "/Tutorials/Smart-contracts/Build-Terra-dApp",
                                "/Tutorials/Smart-contracts/Set-up-local-environment",
                                "/Tutorials/Smart-contracts/Write-smart-contract",
                                "/Tutorials/Smart-contracts/Interact-with-smart-contract",
                                "/Tutorials/Smart-contracts/Manage-CW20-tokens",
                            ],
                            collapsable: true,
                        },
                    ],
                    "/How-to/": [
                        "/How-to/",
                        {
                            title: "Use Terra Station",
                            children: [
                                "/How-to/Terra-Station/Wallet",
                                "/How-to/Terra-Station/Testnet",
                                "/How-to/Terra-Station/Staking",
                                "/How-to/Terra-Station/Swap",
                                "/How-to/Terra-Station/Governance",
                                "/How-to/Terra-Station/Contracts",

                            ],
                            collapsable: true,
                        },
                        {
                            title: "Run a full Terra node",
                            children: [
                                "/How-to/Run-a-full-Terra-node/Hardware-requirements",
                                "/How-to/Run-a-full-Terra-node/Build-Terra-core",
                                "/How-to/Run-a-full-Terra-node/Set-up-production-environment",
                                "/How-to/Run-a-full-Terra-node/Configure-general-settings",
                                "/How-to/Run-a-full-Terra-node/Set-up-private-network",
                                "/How-to/Run-a-full-Terra-node/Join-public-network",

                            ],
                            collapsable: true,
                        },
                        {
                            title: "Manage a Terra validator",
                            children: [
                                "/How-to/Manage-a-Terra-validator/Overview",
                                "/How-to/Manage-a-Terra-validator/Set-up-validator",
                                "/How-to/Manage-a-Terra-validator/Set-up-oracle-feeder",
                                "/How-to/Manage-a-Terra-validator/Court-delegations",
                                "/How-to/Manage-a-Terra-validator/Implement-security",
                                "/How-to/Manage-a-Terra-validator/Troubleshoot-validator-problems",
                                "/How-to/Manage-a-Terra-validator/faq",
                            ],
                            collapsable: true,
                        },
                        "/How-to/Sign-with-multisig",
                        "/How-to/Start-LCD",
                    ],
                    "/Concepts/": [
                        "/Concepts/",
                        "/Concepts/Protocol",
                        "/Concepts/Fees",
                        "/Concepts/glossary",
                    ],
                    "/Reference/": [
                        "/Reference/",
                        {
                            title: "Terra core",
                            collapsable: true,
                            children: [
                                "/Reference/Terra-core/Overview",
                                "/Reference/Terra-core/Module-specifications/spec-auth",
                                "/Reference/Terra-core/Module-specifications/spec-authz",
                                "/Reference/Terra-core/Module-specifications/spec-bank",
                                "/Reference/Terra-core/Module-specifications/spec-capability",
                                "/Reference/Terra-core/Module-specifications/spec-distribution",
                                "/Reference/Terra-core/Module-specifications/spec-evidence",
                                "/Reference/Terra-core/Module-specifications/spec-feegrant",
                                "/Reference/Terra-core/Module-specifications/spec-governance",
                                "/Reference/Terra-core/Module-specifications/spec-market",
                                "/Reference/Terra-core/Module-specifications/spec-mint",
                                "/Reference/Terra-core/Module-specifications/spec-oracle",
                                "/Reference/Terra-core/Module-specifications/spec-slashing",
                                "/Reference/Terra-core/Module-specifications/spec-staking",
                                "/Reference/Terra-core/Module-specifications/spec-treasury",
                                "/Reference/Terra-core/Module-specifications/spec-wasm",
                            ],
                        },
                        {
                            title: "terrad",
                            collapsable: true,
                            children: [
                                "/Reference/terrad/",
                                "/Reference/terrad/commands",
                                "/Reference/terrad/subcommands",
                            ],
                        },
                        "/Reference/integrations",
                        {
                            title: "Ecosystem",
                            collapsable: true,
                            children: [
                                "/Reference/ecosystem",
                                "/Reference/Terra-Delegation-Program/terra-delegation-program.md",
                            ],
                        },
                        "/Reference/endpoints.md",
                        {
                            title: "Other resources",
                            collapsable: true,
                            children: [
                                [
                                    "https://pkg.go.dev/github.com/terra-money/core?tab=subdirectories",
                                    "Terra Core GoDoc",
                                ],
                                ["https://lcd.terra.dev/swagger/", "Terra REST API"],

                            ],
                        },
                    ],
                    "/SDKs/": [
                        "/SDKs/",
                        {
                            title: "terra.js",
                            children: [
                                "/SDKs/Terra-js/Overview",
                                "/SDKs/Terra-js/Common-examples",
                                "/SDKs/Terra-js/Add-modules",
                                "/SDKs/Terra-js/Make-a-connection",
                                "/SDKs/Terra-js/Query-data",
                                "/SDKs/Terra-js/Coin-and-Coins",
                                "/SDKs/Terra-js/Fees",
                                "/SDKs/Terra-js/Keys",
                                "/SDKs/Terra-js/MsgAuthorization",
                                "/SDKs/Terra-js/Multisend",
                                "/SDKs/Terra-js/Numeric",
                                "/SDKs/Terra-js/Oracle-feeder",
                                "/SDKs/Terra-js/Smart-contracts",
                                "/SDKs/Terra-js/Station-extension",
                                "/SDKs/Terra-js/Transactions",
                                "/SDKs/Terra-js/Wallets",
                                "/SDKs/Terra-js/Websockets",
                            ],
                            collapsable: true,
                        },
                    ],

                    "/": [{
                        title: "Overview",
                        children: [
                            "/history-and-changes",
                            "/migration-guide",
                        ],
                        collapsable: false,
                    }, ],
                },
            },
            '/zh/': {
                selectText: '选择语言',
                // 该语言在下拉菜单中的标签
                label: '简体中文',
                nav: [
                    { text: "概要", link: "/zh/" },
                    { text: "教程", link: "/zh/Tutorials/" },
                    { text: "知道", link: "/zh/How-to/" },
                    { text: "概念", link: "/zh/Concepts/" },
                    { text: "参考", link: "/zh/Reference/" },
                    { text: "SDKs", link: "/zh/SDKs/" },
                    {
                        text: "GitHub",
                        link: "https://github.com/terra-money/core",
                        icon: "/img/github.svg",
                    },
                ],
                sidebar: {

                    "/zh/Tutorials/": [
                        "/zh/Tutorials/",
                        {
                            title: "开始",
                            children: [
                                "/zh/Tutorials/Get-started/Terra-Station-desktop",
                                "/zh/Tutorials/Get-started/Terra-Station-extension",
                                "/zh/Tutorials/Get-started/Terra-Station-mobile",
                            ],
                            collapsable: true,
                        },
                        {
                            title: "创建简单 Terra dApp",
                            children: [
                                "/zh/Tutorials/Smart-contracts/Overview",
                                "/zh/Tutorials/Smart-contracts/Build-Terra-dApp",
                                "/zh/Tutorials/Smart-contracts/Set-up-local-environment",
                                "/zh/Tutorials/Smart-contracts/Write-smart-contract",
                                "/zh/Tutorials/Smart-contracts/Interact-with-smart-contract",
                                "/zh/Tutorials/Smart-contracts/Manage-CW20-tokens",
                            ],
                            collapsable: true,
                        },
                    ],
                    "/zh/How-to/": [
                        "/zh/How-to/",
                        {
                            title: "使用 Terra Station",
                            children: [
                                "/zh/How-to/Terra-Station/Wallet",
                                "/zh/How-to/Terra-Station/Testnet",
                                "/zh/How-to/Terra-Station/Staking",
                                "/zh/How-to/Terra-Station/Swap",
                                "/zh/How-to/Terra-Station/Governance",
                                "/zh/How-to/Terra-Station/Contracts",

                            ],
                            collapsable: true,
                        },
                        {
                            title: "运行全 Terra node",
                            children: [
                                "/zh/How-to/Run-a-full-Terra-node/Hardware-requirements",
                                "/zh/How-to/Run-a-full-Terra-node/Build-Terra-core",
                                "/zh/How-to/Run-a-full-Terra-node/Set-up-production-environment",
                                "/zh/How-to/Run-a-full-Terra-node/Configure-general-settings",
                                "/zh/How-to/Run-a-full-Terra-node/Set-up-private-network",
                                "/zh/How-to/Run-a-full-Terra-node/Join-public-network",

                            ],
                            collapsable: true,
                        },
                        {
                            title: "管理 Terra validator",
                            children: [
                                "/zh/How-to/Manage-a-Terra-validator/Overview",
                                "/zh/How-to/Manage-a-Terra-validator/Set-up-validator",
                                "/zh/How-to/Manage-a-Terra-validator/Set-up-oracle-feeder",
                                "/zh/How-to/Manage-a-Terra-validator/Court-delegations",
                                "/zh/How-to/Manage-a-Terra-validator/Implement-security",
                                "/zh/How-to/Manage-a-Terra-validator/Troubleshoot-validator-problems",
                                "/zh/How-to/Manage-a-Terra-validator/faq",
                            ],
                            collapsable: true,
                        },
                        "/zh/How-to/Sign-with-multisig",
                        "/zh/How-to/Start-LCD",
                    ],
                    "/zh/Concepts/": [
                        "/zh/Concepts/",
                        "/zh/Concepts/Protocol",
                        "/zh/Concepts/Fees",
                        "/zh/Concepts/glossary",
                    ],
                    "/zh/Reference/": [
                        "/zh/Reference/",
                        {
                            title: "Terra core",
                            collapsable: true,
                            children: [
                                "/zh/Reference/Terra-core/Overview",
                                "/zh/Reference/Terra-core/Module-specifications/spec-auth",
                                "/zh/Reference/Terra-core/Module-specifications/spec-authz",
                                "/zh/Reference/Terra-core/Module-specifications/spec-bank",
                                "/zh/Reference/Terra-core/Module-specifications/spec-capability",
                                "/zh/Reference/Terra-core/Module-specifications/spec-distribution",
                                "/zh/Reference/Terra-core/Module-specifications/spec-evidence",
                                "/zh/Reference/Terra-core/Module-specifications/spec-feegrant",
                                "/zh/Reference/Terra-core/Module-specifications/spec-governance",
                                "/zh/Reference/Terra-core/Module-specifications/spec-market",
                                "/zh/Reference/Terra-core/Module-specifications/spec-mint",
                                "/zh/Reference/Terra-core/Module-specifications/spec-oracle",
                                "/zh/Reference/Terra-core/Module-specifications/spec-slashing",
                                "/zh/Reference/Terra-core/Module-specifications/spec-staking",
                                "/zh/Reference/Terra-core/Module-specifications/spec-treasury",
                                "/zh/Reference/Terra-core/Module-specifications/spec-wasm",
                            ],
                        },
                        {
                            title: "terrad",
                            collapsable: true,
                            children: [
                                "/zh/Reference/terrad/",
                                "/zh/Reference/terrad/commands",
                                "/zh/Reference/terrad/subcommands",
                            ],
                        },
                        "/zh/Reference/integrations",
                        {
                            title: "Ecosystem",
                            collapsable: true,
                            children: [
                                "/zh/Reference/ecosystem",
                                "/zh/Reference/Terra-Delegation-Program/terra-delegation-program.md",
                            ],
                        },
                        "/zh/Reference/endpoints.md",
                        {
                            title: "Other resources",
                            collapsable: true,
                            children: [
                                [
                                    "https://pkg.go.dev/github.com/terra-money/core?tab=subdirectories",
                                    "Terra Core GoDoc",
                                ],
                                ["https://lcd.terra.dev/swagger/", "Terra REST API"],

                            ],
                        },
                    ],
                    "/zh/SDKs/": [
                        "/zh/SDKs/",
                        {
                            title: "terra.js",
                            children: [
                                "/zh/SDKs/Terra-js/Overview",
                                "/zh/SDKs/Terra-js/Common-examples",
                                "/zh/SDKs/Terra-js/Add-modules",
                                "/zh/SDKs/Terra-js/Make-a-connection",
                                "/zh/SDKs/Terra-js/Query-data",
                                "/zh/SDKs/Terra-js/Coin-and-Coins",
                                "/zh/SDKs/Terra-js/Fees",
                                "/zh/SDKs/Terra-js/Keys",
                                "/zh/SDKs/Terra-js/MsgAuthorization",
                                "/zh/SDKs/Terra-js/Multisend",
                                "/zh/SDKs/Terra-js/Numeric",
                                "/zh/SDKs/Terra-js/Oracle-feeder",
                                "/zh/SDKs/Terra-js/Smart-contracts",
                                "/zh/SDKs/Terra-js/Station-extension",
                                "/zh/SDKs/Terra-js/Transactions",
                                "/zh/SDKs/Terra-js/Wallets",
                                "/zh/SDKs/Terra-js/Websockets",
                            ],
                            collapsable: true,
                        },
                    ],

                    "/zh/": [{
                        title: "Overview",
                        children: [
                            "/zh/history-and-changes",
                            "/zh/migration-guide",
                        ],
                        collapsable: false,
                    }, ],
                },
            },
            '/ja/': {
                selectText: '言語選択',
                // 该语言在下拉菜单中的标签
                label: '日本語',
                nav: [
                    { text: "概要", link: "/ja/" },
                    { text: "チュートリアル", link: "/ja/Tutorials/" },
                    { text: "ノーハウ ", link: "/ja/How-to/" },
                    { text: "概念", link: "/ja/Concepts/" },
                    { text: "参考", link: "/ja/Reference/" },
                    { text: "SDKs", link: "/ja/SDKs/" },
                    {
                        text: "GitHub",
                        link: "https://github.com/terra-money/core",
                        icon: "/img/github.svg",
                    },
                ],
                sidebar: {

                    "/ja/Tutorials/": [
                        "/ja/Tutorials/",
                        {
                            title: "开始",
                            children: [
                                "/ja/Tutorials/Get-started/Terra-Station-desktop",
                                "/ja/Tutorials/Get-started/Terra-Station-extension",
                                "/ja/Tutorials/Get-started/Terra-Station-mobile",
                            ],
                            collapsable: true,
                        },
                        {
                            title: "Terra dApp作成",
                            children: [
                                "/ja/Tutorials/Smart-contracts/Overview",
                                "/ja/Tutorials/Smart-contracts/Build-Terra-dApp",
                                "/ja/Tutorials/Smart-contracts/Set-up-local-environment",
                                "/ja/Tutorials/Smart-contracts/Write-smart-contract",
                                "/ja/Tutorials/Smart-contracts/Interact-with-smart-contract",
                                "/ja/Tutorials/Smart-contracts/Manage-CW20-tokens",
                            ],
                            collapsable: true,
                        },
                    ],
                    "/ja/How-to/": [
                        "/ja/How-to/",
                        {
                            title: "Terra Stationを使う",
                            children: [
                                "/ja/How-to/Terra-Station/Wallet",
                                "/ja/How-to/Terra-Station/Testnet",
                                "/ja/How-to/Terra-Station/Staking",
                                "/ja/How-to/Terra-Station/Swap",
                                "/ja/How-to/Terra-Station/Governance",
                                "/ja/How-to/Terra-Station/Contracts",

                            ],
                            collapsable: true,
                        },
                        {
                            title: "Terra nodeを稼働する",
                            children: [
                                "/ja/How-to/Run-a-full-Terra-node/Hardware-requirements",
                                "/ja/How-to/Run-a-full-Terra-node/Build-Terra-core",
                                "/ja/How-to/Run-a-full-Terra-node/Set-up-production-environment",
                                "/ja/How-to/Run-a-full-Terra-node/Configure-general-settings",
                                "/ja/How-to/Run-a-full-Terra-node/Set-up-private-network",
                                "/ja/How-to/Run-a-full-Terra-node/Join-public-network",

                            ],
                            collapsable: true,
                        },
                        {
                            title: "Terra validator管理",
                            children: [
                                "/ja/How-to/Manage-a-Terra-validator/Overview",
                                "/ja/How-to/Manage-a-Terra-validator/Set-up-validator",
                                "/ja/How-to/Manage-a-Terra-validator/Set-up-oracle-feeder",
                                "/ja/How-to/Manage-a-Terra-validator/Court-delegations",
                                "/ja/How-to/Manage-a-Terra-validator/Implement-security",
                                "/ja/How-to/Manage-a-Terra-validator/Troubleshoot-validator-problems",
                                "/ja/How-to/Manage-a-Terra-validator/faq",
                            ],
                            collapsable: true,
                        },
                        "/ja/How-to/Sign-with-multisig",
                        "/ja/How-to/Start-LCD",
                    ],
                    "/ja/Concepts/": [
                        "/ja/Concepts/",
                        "/ja/Concepts/Protocol",
                        "/ja/Concepts/Fees",
                        "/ja/Concepts/glossary",
                    ],
                    "/ja/Reference/": [
                        "/ja/Reference/",
                        {
                            title: "Terra core",
                            collapsable: true,
                            children: [
                                "/ja/Reference/Terra-core/Overview",
                                "/ja/Reference/Terra-core/Module-specifications/spec-auth",
                                "/ja/Reference/Terra-core/Module-specifications/spec-authz",
                                "/ja/Reference/Terra-core/Module-specifications/spec-bank",
                                "/ja/Reference/Terra-core/Module-specifications/spec-capability",
                                "/ja/Reference/Terra-core/Module-specifications/spec-distribution",
                                "/ja/Reference/Terra-core/Module-specifications/spec-evidence",
                                "/ja/Reference/Terra-core/Module-specifications/spec-feegrant",
                                "/ja/Reference/Terra-core/Module-specifications/spec-governance",
                                "/ja/Reference/Terra-core/Module-specifications/spec-market",
                                "/ja/Reference/Terra-core/Module-specifications/spec-mint",
                                "/ja/Reference/Terra-core/Module-specifications/spec-oracle",
                                "/ja/Reference/Terra-core/Module-specifications/spec-slashing",
                                "/ja/Reference/Terra-core/Module-specifications/spec-staking",
                                "/ja/Reference/Terra-core/Module-specifications/spec-treasury",
                                "/ja/Reference/Terra-core/Module-specifications/spec-wasm",
                            ],
                        },
                        {
                            title: "terrad",
                            collapsable: true,
                            children: [
                                "/ja/Reference/terrad/",
                                "/ja/Reference/terrad/commands",
                                "/ja/Reference/terrad/subcommands",
                            ],
                        },
                        "/ja/Reference/integrations",
                        {
                            title: "Ecosystem",
                            collapsable: true,
                            children: [
                                "/ja/Reference/ecosystem",
                                "/ja/Reference/Terra-Delegation-Program/terra-delegation-program.md",
                            ],
                        },
                        "/ja/Reference/endpoints.md",
                        {
                            title: "Other resources",
                            collapsable: true,
                            children: [
                                [
                                    "https://pkg.go.dev/github.com/terra-money/core?tab=subdirectories",
                                    "Terra Core GoDoc",
                                ],
                                ["https://lcd.terra.dev/swagger/", "Terra REST API"],

                            ],
                        },
                    ],
                    "/ja/SDKs/": [
                        "/ja/SDKs/",
                        {
                            title: "terra.js",
                            children: [
                                "/ja/SDKs/Terra-js/Overview",
                                "/ja/SDKs/Terra-js/Common-examples",
                                "/ja/SDKs/Terra-js/Add-modules",
                                "/ja/SDKs/Terra-js/Make-a-connection",
                                "/ja/SDKs/Terra-js/Query-data",
                                "/ja/SDKs/Terra-js/Coin-and-Coins",
                                "/ja/SDKs/Terra-js/Fees",
                                "/ja/SDKs/Terra-js/Keys",
                                "/ja/SDKs/Terra-js/MsgAuthorization",
                                "/ja/SDKs/Terra-js/Multisend",
                                "/ja/SDKs/Terra-js/Numeric",
                                "/ja/SDKs/Terra-js/Oracle-feeder",
                                "/ja/SDKs/Terra-js/Smart-contracts",
                                "/ja/SDKs/Terra-js/Station-extension",
                                "/ja/SDKs/Terra-js/Transactions",
                                "/ja/SDKs/Terra-js/Wallets",
                                "/ja/SDKs/Terra-js/Websockets",
                            ],
                            collapsable: true,
                        },
                    ],

                    "/ja/": [{
                        title: "Overview",
                        children: [
                            "/ja/history-and-changes",
                            "/ja/migration-guide",
                        ],
                        collapsable: false,
                    }, ],
                },
            },
        },
        sidebarDepth: 3,
        // overrideTheme: 'dark',
        // prefersTheme: 'dark',
        // overrideTheme: { light: [6, 18], dark: [18, 6] },
        // theme: 'default-prefers-color-scheme',
        logo: "/img/docs_logo.svg",
        lastUpdated: "Updated on",
        repo: "highwayns/docs",
        editLinks: true,
        editLinkText: "Edit this page on GitHub",
        docsBranch: 'main',
        docsDir: "docs",
        algolia: {
            apiKey: "5957091e293f7b97f2994bde312aed99",
            indexName: "terra-project",
        },
    },
};