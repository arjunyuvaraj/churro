/**
 * Maps selected skills from the teen survey to task categories they can perform.
 * Used to auto-enable approvedCategories based on survey answers.
 */

const skillToCategoryMap = {
  // Pet-related skills
  pet_care_dogs: ['pet_care'],
  pet_care_cats: ['pet_care'],
  pet_care_birds: ['pet_care'],
  pet_care_other: ['pet_care'],

  // Tech skills
  tech_help_basic: ['tech_help'],
  tech_help_advanced: ['tech_help'],

  // Outdoor/yard work
  yard_work_raking: ['yard_manual'],
  yard_work_planting: ['yard_manual'],
  yard_work_general: ['yard_manual'],
  yard_work_power_tools: ['yard_power', 'yard_manual'], // Power tools enables both

  // Teaching/tutoring
  tutoring_math: ['tutoring'],
  tutoring_english: ['tutoring'],
  tutoring_science: ['tutoring'],
  tutoring_other: ['tutoring'],

  // General services
  services_babysitting: ['babysitting'],
  services_cleaning: ['light_cleaning'],
  services_shopping: ['grocery_run'],
  services_house_sitting: ['house_sitting'],
  services_moving: ['moving_help']
};

/**
 * Given an array of selected skill IDs from the survey,
 * returns a unique array of task category IDs the teen can perform.
 */
export function getApprovedCategoriesFromSkills(skillIds) {
  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    // If no skills selected, enable safe baseline categories
    return ['grocery_run', 'light_cleaning', 'pet_care'];
  }

  const categories = new Set();
  skillIds.forEach((skillId) => {
    const mappedCategories = skillToCategoryMap[skillId];
    if (mappedCategories) {
      mappedCategories.forEach((cat) => categories.add(cat));
    }
  });

  // Always include baseline categories
  categories.add('grocery_run');
  categories.add('light_cleaning');

  return Array.from(categories);
}

export default skillToCategoryMap;
