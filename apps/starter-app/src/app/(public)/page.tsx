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
import { ServiceAreaSection } from '@/components/sections/ServiceAreaSection'
import { TrustStatsSection } from '@/components/sections/TrustStatsSection'
import { BeforeAfterSection } from '@/components/sections/BeforeAfterSection'
import { EditorialProcessSection } from '@/components/sections/EditorialProcessSection'
import { CallCTASection } from '@/components/sections/CallCTASection'
import { LocationStripSection } from '@/components/sections/LocationStripSection'
import { ThreeUpBenefitsSection } from '@/components/sections/ThreeUpBenefitsSection'
import { LargeFeatureSection } from '@/components/sections/LargeFeatureSection'
import { MetricsStripSection } from '@/components/sections/MetricsStripSection'
import { SimpleCallCTASection } from '@/components/sections/SimpleCallCTASection'
import { PullQuoteSection } from '@/components/sections/PullQuoteSection'
import { EditorialFeatureSection } from '@/components/sections/EditorialFeatureSection'
import { PortfolioGridSection } from '@/components/sections/PortfolioGridSection'
import { EditorialFooterCTASection } from '@/components/sections/EditorialFooterCTASection'
import { AlternatingColorBlockSection } from '@/components/sections/AlternatingColorBlockSection'
import { NumberedListSection } from '@/components/sections/NumberedListSection'
import { BigPhotoStripSection } from '@/components/sections/BigPhotoStripSection'
import { BoldFinalCTASection } from '@/components/sections/BoldFinalCTASection'
import { SoftBenefitCardsSection } from '@/components/sections/SoftBenefitCardsSection'
import { TestimonialBubbleSection } from '@/components/sections/TestimonialBubbleSection'
import { SoftStatsRowSection } from '@/components/sections/SoftStatsRowSection'
import { FriendlyFinalCTASection } from '@/components/sections/FriendlyFinalCTASection'
import { GlowingFeatureGridSection } from '@/components/sections/GlowingFeatureGridSection'
import { CodeStripSection } from '@/components/sections/CodeStripSection'
import { NeonStatsSection } from '@/components/sections/NeonStatsSection'
import { TerminalFinalCTASection } from '@/components/sections/TerminalFinalCTASection'
import {
  getContentMany,
  getHomeServicesContent,
  getHowItWorksSteps,
  getHowItWorksDefaultsForLayout,
  getMenuPreviewDishes,
  getServicesPriceListItems,
  getProvidersItems,
  getMissionImpactStats,
  getServiceAreaCities,
  getTrustStatsItems,
  getEditorialProcessSteps,
  getCallCTABullets,
} from '@/lib/content/resolver'
import { getSiteSetting } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getCtaConfig } from '@/lib/cta'
import { MissionValuesPhilosophy } from '@/components/sections/MissionValuesPhilosophy'
import { JoinCareCommunity } from '@/components/sections/JoinCareCommunity'
import { LAYOUT_IDS, LAYOUT_META, type LayoutId, type SectionId, type HeroVariant } from '@/lib/layouts'
import { themes, getThemeStyle, type ThemeName } from '@/lib/theme'
import { themeToCSS, type ResolvedTheme } from '@/lib/theme-resolver'
import { getActiveSelection } from '@/lib/content/activeSelection'

export const dynamic = 'force-dynamic'

const HERO_VARIANTS: HeroVariant[] = [
  'solid_color',
  'image_overlay',
  'split',
  'centered_minimal',
  'editorial_split',
  'block_hero',
  'rounded_card_hero',
  'terminal_hero',
]

// Quick local copy of the resolver's luma() so this preview mode follows the
// same light-vs-dark footer heuristic as getActiveTheme() at runtime.
function previewLuma(hex: string): number {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = num >> 16
  const g = (num >> 8) & 0x00ff
  const b = num & 0x0000ff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function buildPreviewThemeCSS(themeName: ThemeName): string {
  const base = themes[themeName]
  const themeStyle = getThemeStyle(themeName)
  const footerBg =
    (base as { footerBackground?: string }).footerBackground ||
    (previewLuma(base.background) < previewLuma(base.text) ? base.background : base.text)
  const footerText = previewLuma(footerBg) > 190 ? base.text : '#ffffff'
  const resolved: ResolvedTheme = {
    ...base,
    themeName,
    themeStyle,
    fontHeading: siteConfig.branding.fontHeading,
    fontBody: siteConfig.branding.fontBody,
    footerBg,
    footerText,
    heroBg: base.background,
    ctaBg: base.primary,
    sectionSurface: base.surface,
    headerBg: (base as { headerBackground?: string }).headerBackground || base.background,
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
    'about_headline', 'about_body', 'about_text', 'about_quote', 'about_cta_text',
    'about_image', 'about_image_1', 'about_image_2',
    'contact_headline', 'contact_intro',
    'how_it_works_headline', 'how_it_works_subtitle',
    'menu_preview_headline', 'menu_preview_subtitle',
    'services_price_list_headline', 'services_price_list_subtitle',
    'providers_headline', 'providers_subtitle',
    'mission_impact_headline', 'mission_impact_subtitle',
    'mission_impact_body', 'mission_impact_donate_href', 'mission_impact_volunteer_href',
    'service_area_pill', 'service_area_subtitle',
    'trust_stats_pill',
    'before_after_pill', 'before_after_headline', 'before_after_subtitle', 'before_after_caption',
    'before_image', 'after_image',
    'editorial_process_pill', 'editorial_process_headline', 'editorial_process_subtitle',
    'call_cta_pill', 'call_cta_headline',
  ])
  const services = await getHomeServicesContent()
  const heroImage = await getSiteSetting('hero_image_url')
  const business = await getBusinessProfile()
  const enabledModules = await getEnabledModules()
  const cta = await getCtaConfig()

  // Healthcare/residential-care section content from site_settings (optional).
  // If missing, components fall back to their built-in defaults.
  const [missionValuesRaw, communityHeadlineRaw, communitySubheadRaw] = await Promise.all([
    getSiteSetting('mission_values_content'),
    getSiteSetting('community_subscribe_headline'),
    getSiteSetting('community_subscribe_subhead'),
  ])
  let missionValuesContent: {
    mission?: string
    values?: { title: string; body: string }[]
    philosophy?: string
  } | null = null
  if (missionValuesRaw) {
    try {
      const parsed = JSON.parse(missionValuesRaw)
      if (parsed && typeof parsed === 'object') missionValuesContent = parsed
    } catch { /* fall back to component defaults */ }
  }

  // Ensure About heading uses live business_name when DB has it
  // but no explicit about_headline override.
  const aboutHeadline =
    content.about_headline ||
    (business.name ? `About ${business.name}` : '') ||
    'About us'

  // BUG 1C: layout-aware How It Works defaults
  const howItWorks = getHowItWorksDefaultsForLayout(layout)
  const howItWorksHeadline = content.how_it_works_headline || howItWorks.headline
  const howItWorksSubtitle = content.how_it_works_subtitle || howItWorks.subtitle

  const [
    steps, dishes, priceListItems, providersItems, stats,
    serviceAreaCities, trustStatsItems, editorialProcessSteps, callCTABullets,
  ] = await Promise.all([
    getHowItWorksSteps(layout),
    getMenuPreviewDishes(),
    getServicesPriceListItems(),
    getProvidersItems(),
    getMissionImpactStats(),
    getServiceAreaCities(),
    getTrustStatsItems(),
    getEditorialProcessSteps(),
    getCallCTABullets(),
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
        businessName={business.name}
        tagline={business.tagline}
        city={business.city}
        state={business.state}
        phoneCtaLabel={cta.phoneCtaLabel}
        phoneCtaHref={cta.phoneCtaHref}
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
        headline={aboutHeadline}
        body={content.about_text || content.about_body}
        quote={content.about_quote}
        ctaText={content.about_cta_text}
        businessName={business.name}
        city={business.city}
        state={business.state}
        image1={content.about_image_1 || content.about_image || undefined}
        image2={content.about_image_2 || undefined}
      />
    ),
    location: siteConfig.location.showMapOnHome ? (
      <LocationSection
        address={business.address}
        city={business.city}
        state={business.state}
        zip={business.zip}
        hours={business.hours}
        googleMapsEmbed={business.googleMapsEmbed}
      />
    ) : null,
    contact: siteConfig.modules.leads ? (
      <ContactSection
        headline={content.contact_headline}
        intro={content.contact_intro}
      />
    ) : null,
    how_it_works: enabledModules.booking ? (
      <HowItWorksSection
        headline={howItWorksHeadline}
        subtitle={howItWorksSubtitle}
        steps={steps}
      />
    ) : null,
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
    service_area: (
      <ServiceAreaSection
        pill={content.service_area_pill}
        subtitle={content.service_area_subtitle}
        cities={serviceAreaCities}
      />
    ),
    trust_stats: (
      <TrustStatsSection
        pill={content.trust_stats_pill}
        stats={trustStatsItems}
      />
    ),
    before_after: (
      <BeforeAfterSection
        pill={content.before_after_pill}
        headline={content.before_after_headline}
        subtitle={content.before_after_subtitle}
        caption={content.before_after_caption}
        beforeImage={content.before_image || undefined}
        afterImage={content.after_image || undefined}
      />
    ),
    editorial_process: (
      <EditorialProcessSection
        pill={content.editorial_process_pill}
        headline={content.editorial_process_headline}
        subtitle={content.editorial_process_subtitle}
        steps={editorialProcessSteps}
      />
    ),
    call_cta: (
      <CallCTASection
        pill={content.call_cta_pill}
        headline={content.call_cta_headline}
        bullets={callCTABullets}
        phoneNumber={business.phone}
      />
    ),
    location_strip: (
      <LocationStripSection
        address={business.address}
        city={business.city}
        state={business.state}
        zip={business.zip}
      />
    ),
    // modern_minimal
    three_up_benefits: <ThreeUpBenefitsSection />,
    large_feature_left: <LargeFeatureSection imageSide="left" />,
    large_feature_right: <LargeFeatureSection imageSide="right" />,
    metrics_strip: <MetricsStripSection />,
    simple_call_cta: <SimpleCallCTASection />,
    // editorial_premium
    pull_quote: <PullQuoteSection />,
    editorial_feature: <EditorialFeatureSection />,
    portfolio_grid: <PortfolioGridSection />,
    editorial_footer_cta: <EditorialFooterCTASection />,
    // bold_block
    alternating_blocks: <AlternatingColorBlockSection />,
    numbered_list: <NumberedListSection />,
    big_photo_strip: <BigPhotoStripSection />,
    bold_final_cta: <BoldFinalCTASection />,
    // friendly_soft
    soft_benefit_cards: <SoftBenefitCardsSection />,
    testimonial_bubbles: <TestimonialBubbleSection />,
    soft_stats_row: <SoftStatsRowSection />,
    friendly_final_cta: <FriendlyFinalCTASection />,
    // tech_forward
    glowing_feature_grid: <GlowingFeatureGridSection />,
    code_strip: <CodeStripSection />,
    neon_stats: <NeonStatsSection />,
    terminal_final_cta: <TerminalFinalCTASection />,
    // healthcare / residential care add-ons (gated by enabled_modules)
    mission_values: enabledModules.mission_values ? (
      <MissionValuesPhilosophy
        mission={missionValuesContent?.mission}
        values={missionValuesContent?.values}
        philosophy={missionValuesContent?.philosophy}
      />
    ) : null,
    community_subscribe: enabledModules.community_subscribe ? (
      <JoinCareCommunity
        headline={communityHeadlineRaw || undefined}
        subhead={communitySubheadRaw || undefined}
      />
    ) : null,
  }

  // Inject add-on sections into the base sectionOrder based on enabled flags.
  //   mission_values     — after `services`, before `contact` (falls back to end)
  //   community_subscribe — at the end (just before footer)
  const finalOrder: SectionId[] = [...sectionOrder]
  if (enabledModules.mission_values && !finalOrder.includes('mission_values')) {
    const servicesIdx = finalOrder.indexOf('services')
    const contactIdx = finalOrder.indexOf('contact')
    const insertAt =
      servicesIdx >= 0 ? servicesIdx + 1 :
      contactIdx >= 0 ? contactIdx :
      finalOrder.length
    finalOrder.splice(insertAt, 0, 'mission_values')
  }
  if (enabledModules.community_subscribe && !finalOrder.includes('community_subscribe')) {
    finalOrder.push('community_subscribe')
  }

  return (
    <>
      {themeOverrideCSS && <style dangerouslySetInnerHTML={{ __html: themeOverrideCSS }} />}
      {finalOrder.map((id) => {
        const node = sectionMap[id]
        if (!node) return null
        return <div key={id}>{node}</div>
      })}
    </>
  )
}
