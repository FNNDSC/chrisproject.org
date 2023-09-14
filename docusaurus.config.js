// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ChRIS Project',
  tagline: 'ChRIS is an open-source, fully containerized system bridging medical research and the cloud.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://chrisproject.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'FNNDSC', // Usually your GitHub org/user name.
  projectName: 'chrisproject.org', // Usually your repo name.
  trailingSlash: false,
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // We have 2 blogs:
  // - Engineering Blog: high-ish quality write-ups about technical challenges solutions
  //                     (Default blog, configuration not shown below)
  // - Meeting Minutes:  low-ish quality notes about internal meetings
  // - ChRISalis:        The ChRIS Learning Colloquia by Jennings
  //
  // Documentation: https://docusaurus.io/docs/blog#multiple-blogs
  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'meeting_minutes',
        routeBasePath: 'meeting_minutes',
        path: './meeting_minutes',
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'ChRISalis',
        routeBasePath: 'ChRISalis',
        path: './ChRISalis',
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/FNNDSC/website2/tree/master',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/FNNDSC/website2/tree/master',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [{name: 'keywords', content: 'neuroimaging, open science, open source, containers, kubernetes'}],
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'ChRIS Project',
        logo: {
          alt: 'ChRIS logo',
          src: 'img/logo/ChRISlogo-color.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {to: '/blog', label: 'Engineering Blog', position: 'left'},
          {to: '/meeting_minutes', label: 'Meeting Minutes', position: 'left'},
          {to: '/ChRISalis', label: 'ChRISalis', position: 'left'},
          {
            href: 'https://github.com/FNNDSC',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Docs',
          //   items: [
          //     {
          //       label: 'Introduction',
          //       to: '/docs/intro',
          //     },
          //   ],
          // },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          {
            title: 'Organizations',
            items: [
              {
                label: 'Fetal-Neonatal Neuroimaging Developmental Science Center (FNNDSC)',
                to: 'https://fnndsc.org'
              },
              {
                label: "Boston Children's Hospital",
                to: 'https://www.childrenshospital.org/research'
              },
              {
                label: 'New England Research Cloud (NERC)',
                to: 'https://nerc.mghpcc.org/'
              },
              {
                label: 'Red Hat',
                to: 'https://redhat.com'
              }
            ]
          },
          {
            title: 'Get In Touch',
            items: [
              {
                label: 'Matrix Chat',
                to: 'https://matrix.to/#/#chris:fedora.im'
              },
              {
                label: 'Github',
                to: 'https://github.com/FNNDSC'
              },
              {
                label: 'Email (dev@babyMRI.org)',
                to: 'email:dev@babyMRI.org'
              },
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} FNNDSC. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      // https://docusaurus.io/docs/search#connecting-algolia
      algolia: {
        // The application ID provided by Algolia
        appId: '8Z9P3S4SYP',

        // Public API key: it is safe to commit it
        apiKey: '1ba826758178295a8f8409f85cea55d3',

        indexName: 'web2-chrisproject',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        //... other Algolia params
      }
    }),
};

module.exports = config;
