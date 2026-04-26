import { siteConfig } from '@config'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { LocationSection } from '@/components/sections/LocationSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { MenuPreviewSection } from '@/components/sections/MenuPreviewSection'
import { ServicesPriceListSection } from '@/components/sections/ServicesPriceListSection'
import { ProvidersSection } from '@/components/sections/ProvidersSection'
import { MissionImpactSection } from '@/components/sections/MissionImpactSection'
import {
  getContentMany,
  getServicesContent,
  getHowItWorksSteps,
  getMenuPreviewDishes,
  getServicesPriceListItems,
  getProvidersItems,
  getMissionImpactStats,
} from '@/lib/content/resolver'
import { getSiteSetting } from '@/lib/settings'
import { LAYOUT_IDS, LAYOUT_META, type LayoutId, type SectionId, type HeroVariant } from '@/lib/layouts'
import { themes, getThemeStyle, type ThemeName } from '@/lib/theme'
import { themeToCSS, type ResolvedTheme } from '@/lib/theme-resolver'
import { getActiveSelection } from '@/lib/content/activeSelection'

const HERO_VARIANTS: HeroVariant[] = ['solid_color', 'image_overlay', 'split']

function buildPreviewThemeCSS(themeName: ThemeName): string {
  const base = themes[themeName]
  const themeStyle = getThemeStyle(themeName)
  const resolved: ResolvedTheme = {
    ...base,
    themeName,
    themeStyle,
    fontHeading: siteConfig.branding.fontHeading,
    fontBody: siteConfig.branding.fontBody,
    footerBg: base.text,
    footerText: '#ffffff',
    heroBg: base.background,
    ctaBg: base.primary,
    sectionSurface: base.surface,
  }
  return themeToCSS(resolved)
}

export async function generateMetadata() {
  const content = await getContentMany(['meta_home_title', 'meta_home_description'])
  return {
    title: content.meta_home_title,
    description: content.meta_home_description,
  }
}

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const layoutParam = typeof searchParams.layout === 'string' ? searchParams.layout : undefined
  const themeParam = typeof searchParams.theme === 'string' ? searchParams.theme : undefined
  const heroParam = typeof searchParams.hero === 'string' ? searchParams.hero : undefined

  // Precedence: URL preview params > DB active selection > siteConfig.branding
  const active = await getActiveSelection()

  const layout: LayoutId =
    layoutParam && (LAYOUT_IDS as readonly string[]).includes(layoutParam)
      ? (layoutParam as LayoutId)
      : active.layout

  // Theme: the (public) layout already reads `active_theme` via getActiveTheme and emits
  // the matching CSS, so we only need to emit a page-level override when the URL forces
  // a different theme than the active one.
  const themeOverride: ThemeName | null =
    themeParam && themeParam in themes ? (themeParam as ThemeName) : null

  const heroVariant: HeroVariant =
    heroParam && (HERO_VARIANTS as string[]).includes(heroParam)
      ? (heroParam as HeroVariant)
      : active.heroVariant

  const content = await getContentMany([
    'hero_headline', 'hero_subheadline',
    'hero_cta_primary', 'hero_cta_secondary',
    'services_title', 'services_subtitle',
    'about_headline', 'about_body', 'about_quote', 'about_cta_text',
    'contact_headline', 'contact_intro',
    'how_it_works_headline', 'how_it_works_subtitle',
    'menu_preview_headline', 'menu_preview_subtitle',
    'services_price_list_headline', 'services_price_list_subtitle',
    'providers_headline', 'providers_subtitle',
    'mission_impact_headline', 'mission_impact_subtitle',
    'mission_impact_body', 'mission_impact_donate_href', 'mission_impact_volunteer_href',
  ])
  const services = await getServicesContent()
  const heroImage = await getSiteSetting('hero_image_url')

  const [steps, dishes, priceListItems, providersItems, stats] = await Promise.all([
    getHowItWorksSteps(),
    getMenuPreviewDishes(),
    getServicesPriceListItems(),
    getProvidersItems(),
    getMissionImpactStats(),
  ])

  const sectionOrder = LAYOUT_META[layout].sectionOrder
  const themeOverrideCSS = themeOverride ? buildPreviewThemeCSS(themeOverride) : null

  const sectionMap: Record<SectionId, React.ReactNode> = {
    hero: (
      <HeroSection
        headline={content.hero_headline}
        subheadline={content.hero_subheadline}
        ctaPrimary={content.hero_cta_primary}
        ctaSecondary={content.hero_cta_secondary}
        heroImageUrl={heroImage || undefined}
        variant={heroVariant}
      />
    ),
    services: (
      <ServicesSection
        title={content.services_title}
        subtitle={content.services_subtitle}
        services={services}
      />
    ),
    about: (
      <AboutSection
        headline={content.about_headline}
        body={content.about_body}
        quote={content.about_quote}
        ctaText={content.about_cta_text}
      />
    ),
    location: siteConfig.location.showMapOnHome ? <LocationSection /> : null,
    contact: siteConfig.modules.leads ? (
      <ContactSection
        headline={content.contact_headline}
        intro={content.contact_intro}
      />
    ) : null,
    how_it_works: (
      <HowItWorksSection
        headline={content.how_it_works_headline}
        subtitle={content.how_it_works_subtitle}
        steps={steps}
      />
    ),
    menu_preview: (
      <MenuPreviewSection
        headline={content.menu_preview_headline}
        subtitle={content.menu_preview_subtitle}
        dishes={dishes}
      />
    ),
    services_price_list: (
      <ServicesPriceListSection
        headline={content.services_price_list_headline}
        subtitle={content.services_price_list_subtitle}
        services={priceListItems}
      />
    ),
    providers: (
      <ProvidersSection
        headline={content.providers_headline}
        subtitle={content.providers_subtitle}
        providers={providersItems}
      />
    ),
    mission_impact: (
      <MissionImpactSection
        headline={content.mission_impact_headline}
        subtitle={content.mission_impact_subtitle}
        stats={stats}
        missionBody={content.mission_impact_body}
        donateHref={content.mission_impact_donate_href}
        volunteerHref={content.mission_impact_volunteer_href}
      />
    ),
  }

  return (
    <>
      {themeOverrideCSS && <style dangerouslySetInnerHTML={{ __html: themeOverrideCSS }} />}
      {sectionOrder.map((id) => {
        const node = sectionMap[id]
        if (!node) return null
        return <div key={id}>{node}</div>
      })}
    </>
  )
}
