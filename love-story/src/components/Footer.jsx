import { footerInfo } from '../data/storyData'

export default function Footer() {
  return (
    <footer className="px-6 py-10 text-center text-sm text-rose-200/70">
      Made with ❤️ by {footerInfo.madeBy}
    </footer>
  )
}
