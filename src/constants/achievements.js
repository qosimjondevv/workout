// Yutuqlar ro'yxati MA'LUMOT sifatida yozilgan: har biri bitta o'lchov va
// bitta chegara. Shu sabab tekshirish mantig'i bitta funksiyaga sig'adi va
// yangi yutuq qo'shish uchun kod emas, faqat shu ro'yxat o'zgaradi.
//
// metric: "workouts" | "streak" | "pr" | "volume"
// tier:   ko'rinish uchun (bronza / kumush / oltin)
export const ACHIEVEMENTS = [
  {
    key: "first-workout",
    metric: "workouts",
    threshold: 1,
    tier: "bronze",
    icon: "footprints",
    label: "Birinchi qadam",
    description: "Birinchi mashg'ulotingizni yozdingiz",
  },
  {
    key: "workouts-10",
    metric: "workouts",
    threshold: 10,
    tier: "bronze",
    icon: "dumbbell",
    label: "10 ta mashg'ulot",
    description: "Odat shakllana boshladi",
  },
  {
    key: "workouts-50",
    metric: "workouts",
    threshold: 50,
    tier: "silver",
    icon: "dumbbell",
    label: "50 ta mashg'ulot",
    description: "Endi bu jiddiy",
  },
  {
    key: "workouts-100",
    metric: "workouts",
    threshold: 100,
    tier: "gold",
    icon: "dumbbell",
    label: "100 ta mashg'ulot",
    description: "Yuztalik klubi",
  },
  {
    key: "streak-7",
    metric: "streak",
    threshold: 7,
    tier: "bronze",
    icon: "flame",
    label: "7 kunlik seriya",
    description: "Bir hafta uzluksiz",
  },
  {
    key: "streak-30",
    metric: "streak",
    threshold: 30,
    tier: "gold",
    icon: "flame",
    label: "30 kunlik seriya",
    description: "Bir oy tanaffussiz",
  },
  {
    key: "first-pr",
    metric: "pr",
    threshold: 1,
    tier: "bronze",
    icon: "award",
    label: "Birinchi rekord",
    description: "O'zingizni ortda qoldirdingiz",
  },
  {
    key: "pr-10",
    metric: "pr",
    threshold: 10,
    tier: "silver",
    icon: "award",
    label: "10 ta rekord",
    description: "O'sish to'xtamayapti",
  },
  {
    key: "volume-10k",
    metric: "volume",
    threshold: 10000,
    tier: "bronze",
    icon: "layers",
    label: "10 tonna",
    description: "Umumiy hajm 10 000 kg dan oshdi",
  },
  {
    key: "volume-100k",
    metric: "volume",
    threshold: 100000,
    tier: "silver",
    icon: "layers",
    label: "100 tonna",
    description: "Umumiy hajm 100 000 kg dan oshdi",
  },
  {
    key: "volume-1m",
    metric: "volume",
    threshold: 1000000,
    tier: "gold",
    icon: "layers",
    label: "1 million kg",
    description: "Ishonish qiyin, lekin haqiqat",
  },
];

export const TIER_STYLES = {
  bronze: "text-[#C88A54] border-[#C88A54]",
  silver: "text-[#BFC3C9] border-[#BFC3C9]",
  gold: "text-brand-accent border-brand-accent",
};
