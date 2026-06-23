import { footerInfo } from '../data/loveData'

export default function Footer() {
  return (
    <footer className="px-6 py-10 text-center text-sm text-rose-400 dark:text-rose-300">
      Made with ❤️ by {footerInfo.madeBy}
    </footer>
  )
}
