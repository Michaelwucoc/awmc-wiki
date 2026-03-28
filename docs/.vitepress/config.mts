import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AWMC Bot & Services",
  description: "AWMC Bot 及其相关服务的官方帮助文档",
  cleanUrls: true,
  lastUpdated: true,

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        lastUpdatedText: '最后更新于',
        outline: {
          level: [2, 6],
          label: '本页大纲'
        },
        nav: [
          { text: '首页', link: '/' },
          { text: '帮助文档', link: '/guide/introduction' },
          { text: '开发指南', link: '/dev/' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: '📖 基础指南',
              items: [
                { text: 'AWMC 是什么?', link: '/guide/introduction' },
                { text: '快速开始', link: '/guide/getting-started' }
              ]
            },
            {
              text: '🤖 AWMC BOT',
              items: [
                { text: 'AWMC BOT 基础教程', link: '/guide/bot/intro' }
              ]
            }
          ],
          '/dev/': [
            {
              text: '💻 开发者中心',
              items: [
                { text: '开发概览', link: '/dev/' },
                { text: 'API 参考', link: '/dev/api' }
              ]
            }
          ]
        }
      }
    },
    // en: {
    //   label: 'English',
    //   lang: 'en-US',
    //   link: '/en/',
    //   themeConfig: {
    //     lastUpdatedText: 'Last Updated',
    //     outline: {
    //       level: [2, 6],
    //       label: 'On this page'
    //     },
    //     nav: [
    //       { text: 'Home', link: '/en/' },
    //       { text: 'Guide', link: '/en/guide/introduction' },
    //       { text: 'Dev', link: '/en/dev/' }
    //     ],
    //     sidebar: {
    //       '/en/guide/': [
    //         {
    //           text: '📖 Guide',
    //           items: [
    //             { text: 'What is AWMC?', link: '/en/guide/introduction' },
    //             { text: 'Getting Started', link: '/en/guide/getting-started' }
    //           ]
    //         }
    //       ],
    //       '/en/dev/': [
    //         {
    //           text: '💻 Developers',
    //           items: [
    //             { text: 'Dev Overview', link: '/en/dev/' },
    //             { text: 'API Reference', link: '/en/dev/api' }
    //           ]
    //         }
    //       ]
    //     }
    //   }
    // }
  },

  themeConfig: {
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'maildotru', link: 'mailto:awmc@awmc.cc' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present AWMC'
    }
  }
})
