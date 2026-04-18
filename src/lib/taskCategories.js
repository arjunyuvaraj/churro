import {
  Baby,
  Bath,
  BookOpen,
  Brush,
  CarFront,
  ChefHat,
  Computer,
  EggFried,
  PawPrint,
  Sprout,
  Truck,
  Wrench
} from 'lucide-react';

export const taskCategories = [
  { id: 'grocery_run', label: 'Grocery run / errands', icon: ChefHat, minAge: 13, requiresPowerTools: false },
  { id: 'babysitting', label: 'Babysitting / childcare', icon: Baby, minAge: 13, requiresPowerTools: false },
  { id: 'pet_care', label: 'Pet care', icon: PawPrint, minAge: 13, requiresPowerTools: false },
  { id: 'tech_help', label: 'Tech help', icon: Computer, minAge: 13, requiresPowerTools: false },
  { id: 'light_cleaning', label: 'Light cleaning / organizing', icon: Brush, minAge: 13, requiresPowerTools: false },
  { id: 'tutoring', label: 'Tutoring / homework help', icon: BookOpen, minAge: 13, requiresPowerTools: false },
  { id: 'yard_manual', label: 'Yard work - manual tools only', icon: Sprout, minAge: 13, requiresPowerTools: false },
  { id: 'yard_power', label: 'Yard work - power tools', icon: Wrench, minAge: 16, requiresPowerTools: true },
  { id: 'moving_help', label: 'Moving help / heavy lifting', icon: Truck, minAge: 16, requiresPowerTools: false },
  { id: 'house_sitting', label: 'House sitting', icon: Bath, minAge: 13, requiresPowerTools: false }
];

export const categoryById = Object.fromEntries(taskCategories.map((category) => [category.id, category]));

export const categoryOptions = taskCategories.map(({ id, label }) => ({ id, label }));

export const categoryLabels = taskCategories.reduce((accumulator, category) => {
  accumulator[category.id] = category.label;
  return accumulator;
}, {});

export const categoryIcons = {
  grocery_run: ChefHat,
  babysitting: Baby,
  pet_care: PawPrint,
  tech_help: Computer,
  light_cleaning: Brush,
  tutoring: BookOpen,
  yard_manual: Sprout,
  yard_power: Wrench,
  moving_help: Truck,
  house_sitting: Bath
};
