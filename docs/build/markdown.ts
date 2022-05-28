import anchor from 'markdown-it-anchor'
import container from 'markdown-it-container'

import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import type StateCore from 'markdown-it/lib/rules_core/state_core'

export function markdownItSetup(md: MarkdownIt) {
  md
    .use(anchor, { permalink: true, renderPermalink })
    .use(useLinkTarget)
    .use(useContainer)
}

function renderPermalink(slug: string, opts: anchor.AnchorOptions, state: StateCore, index: number) {
  const [startToken, contentToken] = state.tokens.slice(index, index + 2)

  startToken.attrs = [
    ['class', 'anchor']
  ]

  if (startToken.tag !== 'h2') return

  const id = decodeURIComponent(slug)

  contentToken.children = [
    Object.assign(new state.Token('', 'span', 1), {
      attrs: [
        ['id', id],
        ['class', 'anchor__title']
      ]
    }),
    Object.assign(new state.Token('html_block', '', 0), { content: contentToken.content }),
    new state.Token('', 'span', -1),
    Object.assign(new state.Token('link_open', 'a', 1), {
      attrs: [
        ['class', 'anchor__link'],
        ['href', `#${id}`]
      ]
    }),
    Object.assign(new state.Token('html_block', '', 0), { content: '#' }),
    new state.Token('link_close', 'a', -1)
  ]
}

// 为非锚点的链接添加 target 属性
function useLinkTarget(md: MarkdownIt, target = '_blank') {
  const renderer = md.renderer.rules.link_open

  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const className = token.attrGet('class')

    if (!className || !className.includes('anchor__link')) {
      token.attrSet('target', target)
    }

    return (renderer || self.renderToken.bind(self))(tokens, index, options, env, self)
  }
}

function useContainer(md: MarkdownIt) {
  md
    .use(...createContainer('info', '提示'))
    .use(...createContainer('warning', '注意'))
    .use(...createContainer('danger', '警告'))
    .use(container, 'v-pre', {
      render(tokens, index) {
        return tokens[index].nesting === 1
          ? '<div v-pre>\n'
          : '</div>\n'
      }
    })
}

function createContainer(type: string, defaultTitle: string) {
  return [
    container,
    type,
    {
      render(tokens: Token[], index: number) {
        const token = tokens[index]
        // const info = token.info.trim().slice(className.length).trim()

        if (token.nesting === 1) {
          // return `<div class="vxp-alert vxp-alert--${type}"><p class="">${defaultTitle}</p>\n`
          return `<Alert type="${type}" icon title="${defaultTitle}">\n`
        }

        return '</Alert>\n'
      }
    }
  ] as const
}
