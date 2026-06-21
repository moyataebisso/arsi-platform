import { siteConfig } from '@config'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { AboutSection, type HomeAboutBlurb } from '@/components/sections/AboutSection'
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
import { getSiteSetting, getSiteSettings } from '@/lib/settings'
import { getBusinessProfile, displayBusinessName } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getCtaConfig } from '@/lib/cta'
import { MissionValuesPhilosophy } from '@/components/sections/MissionValuesPhilosophy'
import { JoinCareCommunity } from '@/components/sections/JoinCareCommunity'
import { PaymentAndCTA } from '@/components/sections/PaymentAndCTA'
import { RestaurantCtasSection } from '@/components/sections/RestaurantCtasSection'
import { AboutSplitSection } from '@/components/sections/AboutSplitSection'
import { OrderBandSection } from '@/components/sections/OrderBandSection'
import { CateringBandSection } from '@/components/sections/CateringBandSection'
import { ReservationsBandSection } from '@/components/sections/ReservationsBandSection'
import { GalleryStripSection } from '@/components/sections/GalleryStripSection'
import { NewsletterMapSection } from '@/components/sections/NewsletterMapSection'
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
  'video_hero',
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
  // Optional one-line marketing strip under the hero subheadline. Empty/missing
  // → nothing renders. Used by El Roi for the service-list strip.
  const heroBadgeText = await getSiteSetting('hero_badge_text')
  // Optional consolidated home-about blurb (jsonb). When missing, AboutSection
  // falls through to the existing about_text/about_body/about_quote keys and
  // their hardcoded fallbacks — Adama and Entrusted unaffected.
  const homeAboutBlurbRaw = await getSiteSetting('home_about_blurb')
  // video_hero only — both keys swappable per tenant. Poster MUST always
  // render so an empty hero is impossible when the video is blocked/slow.
  const heroVideo = await getSiteSetting('hero_video_url')
  const heroPoster = await getSiteSetting('hero_poster_url')
  const business = await getBusinessProfile()
  // Conversational display name for hero + About headlines and body — strips
  // trailing " LLC" / " Inc.". Footer renders the raw business.name without
  // this helper so the legal entity stays visible.
  const displayedBusinessName = displayBusinessName(business.name)
  const enabledModules = await getEnabledModules()
  const cta = await getCtaConfig()

  // restaurant_centered layout settings — pulled together so the home page
  // can mount the new bands. All keys are optional; sections render their
  // own defaults or noop when the data is missing.
  const restaurantCenteredSettings = await getSiteSettings([
    'about_split_eyebrow',
    'about_split_headline',
    'about_split_body',
    'about_split_image_url',
    'about_split_cta_label',
    'about_split_cta_url',
    'order_band_headline',
    'order_band_subhead',
    'order_band_cta_label',
    'order_url',
    'catering_headline',
    'catering_body',
    'catering_image_url',
    'catering_band_cta_label',
    'reservations_band_eyebrow',
    'reservations_band_headline',
    'reservations_band_subhead',
    'reservations_band_cta_label',
    'reservations_band_cta_url',
    'gallery_strip_images',
    'newsletter_headline',
    'newsletter_intro',
  ])
  let galleryStripImages: string[] = []
  try {
    const raw = restaurantCenteredSettings.gallery_strip_images
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        galleryStripImages = parsed.filter((s): s is string => typeof s === 'string')
      }
    }
  } catch { /* invalid JSON — silently fall through to empty */ }

  // Healthcare/residential-care section content from site_settings (optional).
  // If missing, components fall back to their built-in defaults.
  //
  // Resolution order for each MissionValuesPhilosophy field:
  //   mission     → site_settings.mission_content   → mission_values_content.mission   → default
  //   vision      → site_settings.vision_content    → (none — opt-in column)
  //   philosophy  → site_settings.philosophy_content → mission_values_content.philosophy → default
  //   values      → site_settings.about_values      → mission_values_content.values    → none
  //
  // mission_values_content is preserved for Entrusted backward-compat — they
  // already seed that one JSON blob and should keep rendering unchanged.
  const [
    missionValuesRaw,
    communityHeadlineRaw,
    communitySubheadRaw,
    missionContentRaw,
    visionContentRaw,
    philosophyContentRaw,
    aboutValuesRaw,
  ] = await Promise.all([
    getSiteSetting('mission_values_content'),
    getSiteSetting('community_subscribe_headline'),
    getSiteSetting('community_subscribe_subhead'),
    getSiteSetting('mission_content'),
    getSiteSetting('vision_content'),
    getSiteSetting('philosophy_content'),
    getSiteSetting('about_values'),
  ])
  let missionValuesContent: {
    mission?: string
    vision?: string
    values?: { title: string; body: string }[]
    philosophy?: string
  } | null = null
  if (missionValuesRaw) {
    try {
      const parsed = JSON.parse(missionValuesRaw)
      if (parsed && typeof parsed === 'object') missionValuesContent = parsed
    } catch { /* fall back to component defaults */ }
  }

  // Parse about_values JSON (jsonb array of {title, body|description}) and
  // normalize to the {title, body} shape the MissionValuesPhilosophy expects.
  // Returns null if missing/invalid so caller falls back to mission_values_content.
  const valuesFromAbout: { title: string; body: string }[] | null = (() => {
    if (!aboutValuesRaw) return null
    try {
      const parsed = JSON.parse(aboutValuesRaw)
      if (!Array.isArray(parsed)) return null
      const out: { title: string; body: string }[] = []
      for (const entry of parsed) {
        if (!entry || typeof entry !== 'object') continue
        const r = entry as Record<string, unknown>
        const title = typeof r.title === 'string' ? r.title.trim() : ''
        const body =
          (typeof r.body === 'string' && r.body.trim()) ||
          (typeof r.description === 'string' && r.description.trim()) ||
          ''
        if (title && body) out.push({ title, body })
      }
      return out.length > 0 ? out : null
    } catch {
      return null
    }
  })()

  const resolvedMission = missionContentRaw || missionValuesContent?.mission || undefined
  const resolvedVision = visionContentRaw || missionValuesContent?.vision || undefined
  const resolvedPhilosophy = philosophyContentRaw || missionValuesContent?.philosophy || undefined
  const resolvedValues = valuesFromAbout || missionValuesContent?.values || undefined

  // Parse site_settings.home_about_blurb (jsonb object). Returns null if the
  // key is missing or malformed so AboutSection falls through to its existing
  // legacy props (about_text / about_body / about_quote) — Adama/Entrusted
  // see no change.
  const homeAboutBlurb: HomeAboutBlurb | null = (() => {
    if (!homeAboutBlurbRaw) return null
    try {
      const parsed = JSON.parse(homeAboutBlurbRaw)
      if (!parsed || typeof parsed !== 'object') return null
      const r = parsed as Record<string, unknown>
      const heading = typeof r.heading === 'string' ? r.heading.trim() : undefined
      const quote = typeof r.quote === 'string' ? r.quote.trim() : undefined
      const cta_label = typeof r.cta_label === 'string' ? r.cta_label.trim() : undefined
      const cta_href = typeof r.cta_href === 'string' ? r.cta_href.trim() : undefined
      const paragraphs = Array.isArray(r.paragraphs)
        ? r.paragraphs.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        : undefined
      // Bail to null when nothing useful parsed.
      if (!heading && !quote && !cta_label && !cta_href && (!paragraphs || paragraphs.length === 0)) return null
      return { heading, paragraphs, quote, cta_label, cta_href }
    } catch {
      return null
    }
  })()

  // Ensure About heading uses live business_name when DB has it
  // but no explicit about_headline override. Uses the LLC-stripped
  // display name so the heading reads "About El Roi Health Services"
  // instead of "About El Roi Health Services LLC".
  const aboutHeadline =
    content.about_headline ||
    (displayedBusinessName ? `About ${displayedBusinessName}` : '') ||
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
        heroBadgeText={heroBadgeText || undefined}
        heroVideoUrl={heroVideo || undefined}
        heroPosterUrl={heroPoster || undefined}
        variant={heroVariant}
        businessName={displayedBusinessName}
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
        businessName={displayedBusinessName}
        city={business.city}
        state={business.state}
        image1={content.about_image_1 || content.about_image || undefined}
        image2={content.about_image_2 || undefined}
        blurb={homeAboutBlurb}
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
        mission={resolvedMission}
        vision={resolvedVision}
        values={resolvedValues}
        philosophy={resolvedPhilosophy}
      />
    ) : null,
    community_subscribe: enabledModules.community_subscribe ? (
      <JoinCareCommunity
        headline={communityHeadlineRaw || undefined}
        subhead={communitySubheadRaw || undefined}
      />
    ) : null,
    // payment_cta: flag-gated payment-methods + CTA band. Component
    // self-noops when the flag is off or payment_cta_block jsonb is missing.
    payment_cta: enabledModules.payment_cta ? <PaymentAndCTA /> : null,
    // restaurant_ctas only injects when a RESTAURANT-specific flag is on
    // (order_online or catering). Booking-only tenants like salons/clinics
    // already have their own CTA flow and stay untouched.
    restaurant_ctas:
      enabledModules.order_online || enabledModules.catering ? (
        <RestaurantCtasSection
          showOrder={enabledModules.order_online}
          showCatering={enabledModules.catering}
          showReserve={enabledModules.booking}
        />
      ) : null,
    // restaurant_centered layout bands. Each is data-driven; a section with
    // no content noops itself.
    about_split: (
      <AboutSplitSection
        eyebrow={restaurantCenteredSettings.about_split_eyebrow || business.name}
        headline={restaurantCenteredSettings.about_split_headline || business.tagline}
        body={restaurantCenteredSettings.about_split_body || business.story}
        imageUrl={restaurantCenteredSettings.about_split_image_url}
        ctaLabel={restaurantCenteredSettings.about_split_cta_label}
        ctaUrl={restaurantCenteredSettings.about_split_cta_url}
      />
    ),
    order_band: enabledModules.order_online ? (
      <OrderBandSection
        headline={restaurantCenteredSettings.order_band_headline}
        subhead={restaurantCenteredSettings.order_band_subhead}
        ctaLabel={restaurantCenteredSettings.order_band_cta_label}
        ctaUrl={restaurantCenteredSettings.order_url || '/order'}
      />
    ) : null,
    catering_band: enabledModules.catering ? (
      <CateringBandSection
        headline={restaurantCenteredSettings.catering_headline}
        body={restaurantCenteredSettings.catering_body}
        imageUrl={restaurantCenteredSettings.catering_image_url}
        ctaLabel={restaurantCenteredSettings.catering_band_cta_label}
      />
    ) : null,
    reservations_band: enabledModules.booking ? (
      <ReservationsBandSection
        eyebrow={restaurantCenteredSettings.reservations_band_eyebrow}
        headline={restaurantCenteredSettings.reservations_band_headline}
        subhead={restaurantCenteredSettings.reservations_band_subhead}
        ctaLabel={restaurantCenteredSettings.reservations_band_cta_label}
        ctaUrl={restaurantCenteredSettings.reservations_band_cta_url}
      />
    ) : null,
    gallery_strip: <GalleryStripSection images={galleryStripImages} />,
    newsletter_map: (
      <NewsletterMapSection
        headline={restaurantCenteredSettings.newsletter_headline}
        intro={restaurantCenteredSettings.newsletter_intro}
        googleMapsEmbed={business.googleMapsEmbed}
        address={[business.address, business.city, business.state, business.zip].filter(Boolean).join(', ')}
      />
    ),
  }

  // Inject add-on sections into the base sectionOrder based on enabled flags.
  //   mission_values     — after `services`, before `contact` (falls back to end)
  //   community_subscribe — at the end (just before footer)
  const finalOrder: SectionId[] = [...sectionOrder]
  if (enabledModules.mission_values && !finalOrder.includes('mission_values')) {
    // Anchor selection:
    //   * payment_cta tenants (El Roi-style): insert AFTER `about` so the
    //     story-led narrative reads before the values columns.
    //   * everyone else (Adama, Entrusted): legacy anchor at services + 1.
    //     This keeps Entrusted's existing home order byte-identical and
    //     scopes the reorder to tenants opted into the new El Roi shape.
    const servicesIdx = finalOrder.indexOf('services')
    const contactIdx = finalOrder.indexOf('contact')
    let insertAt: number
    if (enabledModules.payment_cta) {
      const aboutIdx = finalOrder.indexOf('about')
      insertAt =
        aboutIdx >= 0 ? aboutIdx + 1 :
        servicesIdx >= 0 ? servicesIdx + 1 :
        contactIdx >= 0 ? contactIdx :
        finalOrder.length
    } else {
      insertAt =
        servicesIdx >= 0 ? servicesIdx + 1 :
        contactIdx >= 0 ? contactIdx :
        finalOrder.length
    }
    finalOrder.splice(insertAt, 0, 'mission_values')
  }
  if (enabledModules.community_subscribe && !finalOrder.includes('community_subscribe')) {
    finalOrder.push('community_subscribe')
  }
  // Inject payment_cta right after mission_values when present, else before
  // location/contact. Falls back to end-of-list so it never silently
  // disappears for layouts without location/contact.
  if (enabledModules.payment_cta && !finalOrder.includes('payment_cta')) {
    const missionIdx = finalOrder.indexOf('mission_values')
    const locationIdx = finalOrder.indexOf('location')
    const contactIdx = finalOrder.indexOf('contact')
    const insertAt =
      missionIdx >= 0 ? missionIdx + 1 :
      locationIdx >= 0 ? locationIdx :
      contactIdx >= 0 ? contactIdx :
      finalOrder.length
    finalOrder.splice(insertAt, 0, 'payment_cta')
  }
  // Inject the restaurant CTA strip (Order / Catering / Reserve) right after
  // the hero. Only when a RESTAURANT-specific flag is on so we don't push a
  // strip onto unrelated booking-only tenants.
  const anyRestaurantCta = enabledModules.order_online || enabledModules.catering
  if (anyRestaurantCta && !finalOrder.includes('restaurant_ctas')) {
    const heroIdx = finalOrder.indexOf('hero')
    const insertAt = heroIdx >= 0 ? heroIdx + 1 : 0
    finalOrder.splice(insertAt, 0, 'restaurant_ctas')
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
