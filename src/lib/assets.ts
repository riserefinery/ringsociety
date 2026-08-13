/* -----------------------------------------------------------------
   Central asset registry.
   Public images and SVGs are held in managed storage so the Figma
   source tree remains lightweight for GitHub, Vercel, and checkpoints.
----------------------------------------------------------------- */
import svgPaths from '../../imports/svg-4693nptjky'

const logoWordmark = '/manus-storage/Ring_Society_Logo_blk_922d1612.svg'
const logoXL = '/manus-storage/Ring_Society_XL_Logo_0a84c7de.svg'
const iconRS = '/manus-storage/Ring_Society_Icon_-_RS_0b6a185d.svg'
const iconDiamond = '/manus-storage/Ring_Society_Icon_62630914.svg'
const iconCream = '/manus-storage/Ring_Society_Icon_-_Cream_c1aef761.svg'
const burgerMenu = '/manus-storage/Burger_Menu_cde4ba3e.svg'

const heroImg = '/manus-storage/How_to_Buy_an_Engagement_Ring_-_hero_image_14b4a989.jpg'
const heroMobileImg = '/manus-storage/Engagement-Ring-Guide_m_5a996dcd.jpg'
const trendingImg = '/manus-storage/The_Most_Popular___Trending_Ring_Styles_and_Diamonds_in_2026_55ba9b89.jpg'
const haloImg = '/manus-storage/Engagement_Rings_with_Hidden_Halos__The_Subtle_Sparkle_Trend_79cd3dd2.jpg'
const budgetsImg = '/manus-storage/Engagement_Ring_Budgets__How_Much_Should_You_Spend__5f1246ea.jpg'
const ctaBgImg = '/manus-storage/CTA_background_-_green_marble_77ed8287.jpg'
const jewelerImg = '/manus-storage/How_to_Choose_A_Jeweler_Our_10-Point_Framework_920a1440.jpg'
const settingsImg = '/manus-storage/The_Complete_Guide_to_Engagement_Ring_Settings___Styles_0c73bcd6.jpg'
const ringSizeImg = '/manus-storage/How_to_Find_Her_Ring_Size_Without_Ruining_the_Surprise_d20e0efa.jpg'
const shapeImg = '/manus-storage/Which_Diamond_Shape_Looks_the_Biggest__abce2cf6.jpg'
const fourCsImg = '/manus-storage/The_4Cs_of_Diamonds__Explained_in_Plain_English__57d54379.jpg'
const labGrownImg = '/manus-storage/Natural_vs._Lab-Grown_Diamonds___The_Honest__Unbiased_Comparison_b9e7ef34.jpg'
const pricingImg = '/manus-storage/What_Drives_Diamond_Pricing__Hear_from_Experts_d453eccf.jpg'
const clarityImg = '/manus-storage/The_Ultimate_Guide_to_Diamond_Clarity__and_What_it_Means_for_Your_Ring_Choice___Budget_3443ba1e.jpg'
const idealCutImg = '/manus-storage/The_Ideal_Diamond_Cut__How_to_Choose_the_Right_Diamond_for_Your_Ring_Setting_and_Budget_c1afc18c.jpg'
const emeraldImg = '/manus-storage/Go_Big_or_Shop_Small___Big-Box_vs._Local_vs._Online_c6c7b1dd.jpg'

const topGuidesBg = '/manus-storage/Top_Guides_Background_b7ab4a41.jpg'
const resourcesBg = '/manus-storage/94027a749f977f70fa989f40a07a6481c00c0fd9_55c179c4.png'
const articleHero = '/manus-storage/98a44bfc0d78312ffec38747b3c385fc311f9afb_2db526ee.png'
const articleAnatomy = '/manus-storage/14de68af74bb0028ee097000d82e7bd909bc645a_0c22cb9b.png'
const articleSettings = '/manus-storage/f6b7946290e8e59416f3a581cd421de387dffbbf_3c11ecf3.png'
const shareArrow = '/manus-storage/Arrow_0d0be557.svg'
const ctaLabGrown = '/manus-storage/Lab_Grown_vs_Natural_Diamonds_Article-1_d325c26e.jpg'

const missionHero = '/manus-storage/Ring_Society___Mission__Vision_and_Values_d4606450.png'
const missionHeroMobile = '/manus-storage/Ring_Society___Mission__Vision_and_Values_m_fc5607be.jpg'
const visionImg = '/manus-storage/The_most_trusted__unbiased__and_comprehensive_resource_for_couples_choosing_an_engagement_ring_23e91904.jpg'
const visionImgMobile = '/manus-storage/The_most_trusted__unbiased__and_comprehensive_resource_for_couples_choosing_an_engagement_ring_m_9a7faba6.jpg'
const iconResearch = '/manus-storage/Ring_Society_Research_28b80bc8.svg'
const iconResources = '/manus-storage/Ring_Society_Resources_ed2bb5ce.svg'
const iconMatch = '/manus-storage/Ring_Society_Jeweler_Matching_6229c44d.svg'

const gfJeweler = '/manus-storage/How_to_Choose_A_Jeweler___Our_10-Point_Framework_607821d1.jpg'
const gfBudgets = '/manus-storage/Engagement_Ring_Budgets__How_Much_Should_You_Spend_-1_1d14e545.jpg'
const gfLabGrown = '/manus-storage/Natural_vs._Lab-Grown_Diamonds__The_Honest__Unbiased_Comparison_3ba8bfa3.jpg'
const gfBigBox = '/manus-storage/Go_Big_or_Shop_Small___Big-Box_vs._Local_vs._Online-1_1028c798.jpg'
const gfPricing = '/manus-storage/What_Drives_Diamond_Pricing__Hear_from_Experts-1_47d5a097.jpg'
const gfClarity = '/manus-storage/The_Ultimate_Guide_to_Diamond_Clarity__and_What_it_Means_for_Your_Ring_Choice___Budget-1_f86fcc6a.jpg'
const gfSettings = '/manus-storage/The_Complete_Guide_to_Engagement_Ring_Settings___Styles-1_49187b80.jpg'

export {
  svgPaths,
  logoWordmark,
  logoXL,
  iconRS,
  iconDiamond,
  iconCream,
  burgerMenu,
  heroImg,
  heroMobileImg,
  topGuidesBg,
  resourcesBg,
  missionHero,
  missionHeroMobile,
  visionImg,
  visionImgMobile,
  iconResearch,
  iconResources,
  iconMatch,
  articleHero,
  articleAnatomy,
  articleSettings,
  shareArrow,
  ctaLabGrown,
}

export const GUIDE_FEATURES = {
  jeweler: gfJeweler,
  budgets: gfBudgets,
  labGrown: gfLabGrown,
  bigBox: gfBigBox,
  pricing: gfPricing,
  clarity: gfClarity,
  settings: gfSettings,
}

export const IMAGES = {
  hero: heroImg,
  heroMobile: heroMobileImg,
  trending: trendingImg,
  halo: haloImg,
  budgets: budgetsImg,
  jeweler: jewelerImg,
  settings: settingsImg,
  ringSize: ringSizeImg,
  shape: shapeImg,
  fourCs: fourCsImg,
  emerald: emeraldImg,
  labGrown: labGrownImg,
  pricing: pricingImg,
  clarity: clarityImg,
  idealCut: idealCutImg,
  roses: ctaBgImg,
}
