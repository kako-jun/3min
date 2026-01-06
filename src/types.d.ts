import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        id?: string
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month'
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final'
        digits?: string
        format?: 'text' | 'svg' | 'image' | 'json'
        'api-base'?: string
      }
    }
  }
}
