import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const QUESTIONS = [
  // ── FÖRRÄTT – Cykeltema ──────────────────────────────────────────────
  {
    question: "Charter — Vilket märke tillverkar denna cykelkomponent? (bild)",
    options: ["Shimano", "SRAM", "Campagnolo", "FSA"],
    correctAnswer: 2,
    orderIndex: 0,
  },
  {
    question: "Charter — Vad heter denna cykeltyp? (bild)",
    options: ["Velomobil", "Liggcykel", "Pennyfarthing", "Tandemcykel"],
    correctAnswer: 2,
    orderIndex: 1,
  },
  {
    question: "Charter — Hur många kubikcentimeter har motorn du just hörde? (ljud)",
    options: ["125 cc", "600 cc", "1000 cc", "1800 cc"],
    correctAnswer: 1,
    orderIndex: 2,
  },
  {
    question: "Charter — Vilket land vinner flest etapper i Tour de France historiskt?",
    options: ["Belgien", "Spanien", "Frankrike", "Italien"],
    correctAnswer: 2,
    orderIndex: 3,
  },
  {
    question: "Charter — Vad kallas den gula ledartröjan i Tour de France?",
    options: ["Maillot jaune", "Maillot vert", "Maillot rouge", "Maillot blanc"],
    correctAnswer: 0,
    orderIndex: 4,
  },
  // ── VARMRÄTT – Kanintema ─────────────────────────────────────────────
  {
    question: "Safari — Vilken känd kaninkaraktär syns på bilden? (bild)",
    options: ["Nestor", "Br'er Rabbit", "Peter Rabbit", "Velveteen Rabbit"],
    correctAnswer: 2,
    orderIndex: 5,
  },
  {
    question: "Safari — Från vilken bok kommer denna kaninkaraktär? (bild)",
    options: ["Bamse", "Winnie-the-Pooh", "Alice i Underlandet", "Watership Down"],
    correctAnswer: 2,
    orderIndex: 6,
  },
  {
    question: "Safari — I vilken roman av John Updike är Harry \"Rabbit\" Angström huvudperson?",
    options: ["Rabbit, Run", "The Velveteen Rabbit", "Watership Down", "Br'er Rabbit"],
    correctAnswer: 0,
    orderIndex: 7,
  },
  {
    question: "Safari — Vad heter kaninen i Bamse-serierna?",
    options: ["Lille Skutt", "Nansen", "Jansson", "Lille Hopp"],
    correctAnswer: 0,
    orderIndex: 8,
  },
  {
    question: "Safari — Vad är en kaningrupps sammanboende benämning?",
    options: ["Flock", "Koloni", "Stim", "Hjord"],
    correctAnswer: 1,
    orderIndex: 9,
  },
  // ── EFTERRÄTT – Sprittema ────────────────────────────────────────────
  {
    question: "Fjällvandring — Vilket land tillverkar denna sprit? (bild)",
    options: ["Skottland", "Irland", "Japan", "Kentucky"],
    correctAnswer: 2,
    orderIndex: 10,
  },
  {
    question: "Fjällvandring — Vad heter denna drinkklass? (bild)",
    options: ["Sling", "Fizz", "Sour", "Highball"],
    correctAnswer: 2,
    orderIndex: 11,
  },
  {
    question: "Fjällvandring — Vad är huvudingrediensen i en Negroni?",
    options: ["Vodka", "Gin", "Rom", "Tequila"],
    correctAnswer: 1,
    orderIndex: 12,
  },
  {
    question: "Fjällvandring — Vilken frukt används för att göra Calvados?",
    options: ["Päron", "Vindruva", "Äpple", "Plommon"],
    correctAnswer: 2,
    orderIndex: 13,
  },
  {
    question: "Fjällvandring — Hur många cl innehåller ett standardglas vin på restaurang i Sverige?",
    options: ["10 cl", "15 cl", "20 cl", "25 cl"],
    correctAnswer: 1,
    orderIndex: 14,
  },
];

async function main() {
  // Delete existing quiz questions (polls with correctAnswer set)
  const deleted = await prisma.poll.deleteMany({ where: { correctAnswer: { not: null } } });
  console.log(`Deleted ${deleted.count} existing quiz questions.`);

  for (const q of QUESTIONS) {
    await prisma.poll.create({
      data: {
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        orderIndex: q.orderIndex,
      },
    });
  }
  console.log(`✓ Inserted ${QUESTIONS.length} quiz questions.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
