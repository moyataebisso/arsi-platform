import { siteConfig } from '../../../site.config'

export function isModuleEnabled(module: keyof typeof siteConfig.modules): boolean {
  return siteConfig.modules[module] === true
}
