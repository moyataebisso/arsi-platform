import { siteConfig } from '@config'

export const isDeveloperMode = siteConfig.arsiPlatform.mode === 'developer'
export const isLocalBusiness = siteConfig.arsiPlatform.mode === 'local-business'
export const isMonitoringEnabled = siteConfig.arsiPlatform.monitoringEnabled && isLocalBusiness
export const showPoweredBy = siteConfig.arsiPlatform.showPoweredBy && !isDeveloperMode
