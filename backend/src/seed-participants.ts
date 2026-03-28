import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── TEAMS ───────────────────────────────────────────────────────────────────
const TEAMS = [
  "Alpresa", "Backpacking", "Camping", "Charter", "Club 33",
  "Fjällvandring", "Kryssning", "Safari", "Träningsresa", "Tågluff",
];

// ─── PARTICIPANTS ─────────────────────────────────────────────────────────────
// Fields: name, familyId, phone, address, email, dietary, team,
//         forratHost, varmrattHost, efterrattHost
type P = {
  name: string; familyId: string; phone?: string; address?: string;
  email?: string; dietary?: string; team: string;
  forratHost: string; varmrattHost: string; efterrattHost: string;
};

const PARTICIPANTS: P[] = [
  { name: "Linda Adwall", familyId: "F001", phone: "0707498514", address: "Domherrevägen 15a", email: "linda1921@hotmail.com", team: "Alpresa", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Daniel Adwall", familyId: "F001", phone: "0708882012", address: "Domherrevägen 15a", email: "daniel.adwall@seb.se", team: "Alpresa", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Linda Ahlgren", familyId: "F002", phone: "0709733573", address: "Ekvägen 10", email: "lindaahlgren77@hotmail.com", team: "Alpresa", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Tobias Ahlgren", familyId: "F002", phone: "0708178560", address: "Ekvägen 10", email: "Tobias@rawmotion.se", team: "Charter", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Ann-Carine Alm", familyId: "F003", address: "Blomstervägen 26", email: "sigge.lind@gmail.com", team: "Backpacking", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Sigge Lind", familyId: "F003", phone: "0709255253", address: "Blomstervägen 26", email: "sigge.lind@gmail.com", team: "Fjällvandring", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Jenny Andersson Collby", familyId: "F004", phone: "0735919818", address: "Pilfinksvägen 1", email: "daniel.collby@cytiva.com", dietary: "Nötter", team: "Camping", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Daniel Andersson Collby", familyId: "F004", phone: "0734399396", address: "Pilfinksvägen 1", email: "jacollby@gmail.com", team: "Träningsresa", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Kajsa Bennbom Lindner", familyId: "F005", phone: "0733661214", address: "Blomstervägen 46", email: "kajsalindner@bennbom.se", team: "Charter", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Mathias Lindner", familyId: "F005", phone: "0708744527", address: "Blomstervägen 46", email: "kajsalindner@bennbom.se", team: "Alpresa", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Jenny Bexell", familyId: "F006", phone: "0709324201", address: "Ekvägen 6A", email: "jenny.bexell@gmail.com", team: "Club 33", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Marcus Lindholm", familyId: "F006", phone: "0709501010", address: "Ekvägen 6A", email: "marcuslindholm2@gmail.com", team: "Kryssning", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Carolina Björklund", familyId: "F007", phone: "0765438872", address: "Sjövägen 1A", email: "gustafbjorklund@hotmail.com", team: "Fjällvandring", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Gustaf Björklund", familyId: "F007", phone: "0761049699", address: "Sjövägen 1A", email: "gustafbjorklund@hotmail.com", team: "Alpresa", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Sara Blomberg", familyId: "F008", phone: "0738112513", address: "Ormvråksvägen 3", email: "magnus.blomberg@hotmail.com", team: "Backpacking", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Magnus Blomberg", familyId: "F008", phone: "0704883735", address: "Ormvråksvägen 3", email: "sara_ljungberg@hotmail.com", team: "Backpacking", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Stina Bohman", familyId: "F009", phone: "0707508116", address: "Blåhakevägen 32", email: "stina.bohman@me.com", team: "Kryssning", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Peter Bohman", familyId: "F009", phone: "0706343109", address: "Blåhakevägen 32", email: "peterbohman72@gmail.com", team: "Alpresa", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Katarina Börling", familyId: "F010", phone: "0730468162", address: "Jägarvägen 19", email: "katarina.borling@telia.com", dietary: "Ingen måltid", team: "Fjällvandring", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Marcus Börling", familyId: "F010", phone: "0706332269", address: "Jägarvägen 19", email: "marcus.borling@telia.com", dietary: "Ingen måltid", team: "Fjällvandring", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Karin Eckerbom", familyId: "F011", address: "Blåhakevägen 42", email: "per.eckerbom@hotmail.com", team: "Camping", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Per Eckerbom", familyId: "F011", phone: "0704133324", address: "Blåhakevägen 42", email: "karin.eckerbom@hotmail.com", dietary: "Persilja, exotiska frukter, nötter", team: "Camping", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Marie Eklöf", familyId: "F012", address: "Krickvägen 46", email: "marie.eklof@outlook.com", team: "Safari", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Sven-Åke Eklöf", familyId: "F012", address: "Krickvägen 46", email: "sven.ake.eklof@gmail.com", team: "Charter", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Jennie Ekstrand", familyId: "F013", phone: "0703669666", address: "Rapphönsvägen 4C", email: "anderssonjennie@yahoo.com", team: "Träningsresa", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Christofer Ekstrand", familyId: "F013", phone: "0702609113", address: "Rapphönsvägen 4C", email: "christofer.ekstrand@yahoo.se", team: "Fjällvandring", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Victoria Enkvist", familyId: "F014", phone: "0702245545", address: "Häckvägen 6C", email: "tommy.enkvist@ravindi.se", team: "Tågluff", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Tommy Enkvist", familyId: "F014", phone: "0767775090", address: "Häckvägen 6C", email: "tommy.enkvist@ravindi.se", team: "Backpacking", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Ulrika Eriksson", familyId: "F015", phone: "0707997710", address: "Morkullevägen 23", email: "ulrikaeriksson69@hotmail.com", team: "Alpresa", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Juppe Carlsson", familyId: "F015", phone: "0707998862", address: "Morkullevägen 23", email: "juppecarlsson62@hotmail.com", team: "Fjällvandring", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Cecilia Fernholm", familyId: "F016", phone: "0706344191", address: "Morkullevägen 51B", email: "fernholmcecilia@gmail.com", team: "Backpacking", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "LG Lundgren", familyId: "F016", phone: "0733449517", address: "Morkullevägen 51B", email: "lglundgren@gmail.com", team: "Club 33", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Sabine Gebert Persson", familyId: "F017", phone: "0707486178", address: "Tjädervägen 27 B", email: "sabinegpersson@gmail.com", team: "Camping", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Ronny Persson", familyId: "F017", phone: "0739683726", address: "Tjädervägen 27 B", email: "ronny.persson@lansforsakringar.se", dietary: "Avokado, nötter", team: "Kryssning", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Charlotte Gelin Bornudd", familyId: "F018", phone: "0703001011", address: "Lyssnavägen 6", email: "gelin.bornudd@gmail.com", team: "Safari", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Mikael Gelin", familyId: "F018", phone: "0709164590", address: "Lyssnavägen 6", email: "gelin.bornudd@gmail.com", team: "Safari", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Eva Hartman-Juhlin", familyId: "F019", phone: "0760181632", address: "Svankärrsvägen 3B", email: "evahj56@hotmail.com", team: "Träningsresa", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Christopher Juhlin", familyId: "F019", phone: "0708860189", address: "Svankärrsvägen 3B", email: "evahj56@hotmail.com", team: "Träningsresa", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Jenny Hedberg", familyId: "F020", phone: "0736635688", address: "Tjädervägen 18", email: "jennyhedberg1972@gmail.com", team: "Charter", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Andreas Larsson", familyId: "F020", phone: "0709759951", address: "Tjädervägen 18", email: "jennyhedberg1972@gmail.com", team: "Tågluff", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Ulrica Hedman", familyId: "F021", phone: "0739641566", address: "Klippvägen 4", email: "hedmanulrica@gmail.com", team: "Club 33", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Peter Stenlund", familyId: "F021", phone: "0706991361", address: "Klippvägen 4", email: "hedmanulrica@gmail.com", team: "Backpacking", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Maria Hellman", familyId: "F022", phone: "0703633997", address: "Rödhakevägen 29C", email: "maria.hellman@gmail.com", team: "Fjällvandring", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Mats Hellman", familyId: "F022", phone: "0730848262", address: "Rödhakevägen 29C", email: "mats.hellman@gmail.com", team: "Safari", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Anna Hårdstedt", familyId: "F023", phone: "0734202123", address: "Ekvägen 15", email: "ahardstedt@gmail.com", team: "Kryssning", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Markus Haukkala", familyId: "F023", phone: "0727163355", address: "Ekvägen 15", email: "markus.haukkala@hotmail.se", team: "Backpacking", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Lena Jonsson", familyId: "F024", phone: "0722157981", address: "Skogsduvevägen 17 B", email: "lejonmaria@hotmail.com", team: "Charter", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Jörgen Jonsson", familyId: "F024", address: "Skogsduvevägen 17 B", email: "lejonmaria@hotmail.com", team: "Charter", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Emma Julin", familyId: "F025", phone: "0733109455", address: "Rälsvägen 21", email: "emmasjulin@gmail.com", team: "Club 33", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Michell Julin", familyId: "F025", phone: "0733948489", address: "Rälsvägen 21", email: "michell.julin@gmail.com", team: "Club 33", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Annika Kits", familyId: "F026", phone: "0735270652", address: "Askvägen 66", email: "Marcus.andersson@skanska.se", team: "Safari", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Marcus Andersson", familyId: "F026", phone: "0703449587", address: "Askvägen 66", email: "Marcus.andersson@skanska.se", team: "Alpresa", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Anette Kravik", familyId: "F027", phone: "0739719054", address: "Ekvägen 1", email: "anette.kravik@gmail.com", team: "Kryssning", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Micke Kravik", familyId: "F027", phone: "0739719052", address: "Ekvägen 1", email: "kravik.mikael@gmail.com", team: "Kryssning", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Cecilia Krona", familyId: "F028", phone: "0708900980", address: "Rosenvägen 9B", email: "ceciliakrona@gmail.com", dietary: "Nötter, skaldjur", team: "Träningsresa", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Niclas Krona", familyId: "F028", phone: "0725017258", address: "Rosenvägen 9B", email: "niclas.krona@me.com", team: "Camping", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Mari Kumlien", familyId: "F029", phone: "0704440736", address: "Fasanvägen 10B", team: "Tågluff", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Svante Kumlien", familyId: "F029", phone: "0720796541", address: "Fasanvägen 10B", team: "Fjällvandring", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Ingela Lennerstrand", familyId: "F030", phone: "0707328398", address: "Höjdvägen 30B", email: "johan.lennerstrand@medsci.uu.se", team: "Alpresa", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Johan Lennerstrand", familyId: "F030", phone: "0704322337", address: "Höjdvägen 30B", email: "ingelalennerstrand@gmail.com", team: "Safari", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Sofia Lernskog", familyId: "F031", phone: "0704792514", address: "Rosenvägen 52", email: "daniel.arvik@spendrups.se", team: "Backpacking", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Daniel Årvik", familyId: "F031", phone: "0701827814", address: "Rosenvägen 52", email: "slernskog@gmail.com", team: "Charter", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Anna Lidenholm", familyId: "F032", phone: "0708913019", address: "Talgoxvägen 7", email: "anna.lidenholm@gmail.com", team: "Camping", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Håkan Lidenholm", familyId: "F032", phone: "0723011500", address: "Talgoxvägen 7", email: "hakan.lidenholm@gmail.com", team: "Safari", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Lena Liljeström", familyId: "F033", phone: "0704243412", address: "Jägarvägen 4", email: "per.liljestrom@gmail.com", team: "Tågluff", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Per Liljeström", familyId: "F033", phone: "0703019959", address: "Jägarvägen 4", email: "lena.liljestrom@gmail.com", dietary: "Fisk, kyckling", team: "Tågluff", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Kajsa Lindner Bennbom", familyId: "F034", phone: "0733661214", address: "Blomstervägen 46", email: "kajsalindner@bennbom.se", team: "Charter", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Mattias Lindner", familyId: "F034", phone: "0708744527", address: "Blomstervägen 46", email: "kajsalindner@bennbom.se", team: "Safari", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Marie Linton", familyId: "F035", address: "Rödhakevägen 27A", email: "hasselinton@hotmail.se", team: "Club 33", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Hans Linton", familyId: "F035", address: "Rödhakevägen 27A", email: "hasselinton@hotmail.se", team: "Alpresa", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Cecilia Lund", familyId: "F036", phone: "0763072223", address: "Rosenvägen 1", email: "ceciliamarialund@hotmail.com", team: "Fjällvandring", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Mattias Lund", familyId: "F036", phone: "0705725712", address: "Rosenvägen 1", email: "mattias737@gmail.com", team: "Camping", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Marie-Louise Mattsson", familyId: "F037", phone: "0705494585", address: "Höjdvägen 10", email: "marielouisep@yahoo.com", team: "Kryssning", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Per Mattsson", familyId: "F037", phone: "0733574575", address: "Höjdvägen 10", email: "marielouisep@yahoo.com", team: "Träningsresa", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Deborah McGott", familyId: "F038", phone: "0737231590", address: "Rosenvägen 31 B", email: "deborah.mcgott@gmail.com", team: "Safari", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "David McGott", familyId: "F038", phone: "07204366822", address: "Rosenvägen 31 B", email: "david.mcgott375@gmail.com", team: "Camping", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Milla Mohr", familyId: "F039", phone: "0722361893", address: "Almstigen 30", email: "miljuu@hotmail.com", team: "Träningsresa", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Matthias Mohr", familyId: "F039", phone: "0767785227", address: "Almstigen 30", email: "miljuu@hotmail.com", team: "Backpacking", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Cecilia Olsson", familyId: "F040", phone: "0733210751", address: "Åkervägen 46", email: "callehakansson@gmail.com", team: "Tågluff", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Calle Håkansson", familyId: "F040", phone: "0766235732", address: "Åkervägen 46", email: "ceciliaolsson700@gmail.com", team: "Charter", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Victoria Enkvist; Tommy Enkvist", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Malin Olsson", familyId: "F041", address: "Gärdesvägen 5", email: "olssonnorstrom@gmail.com", team: "Alpresa", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Linda Adwall; Daniel Adwall" },
  { name: "Tobias Norström", familyId: "F041", address: "Gärdesvägen 5", email: "olssonnorstrom@gmail.com", team: "Kryssning", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Helena Pettersson", familyId: "F042", phone: "0703763746", address: "Lönnviksvägen 10 B", email: "fam.h.pettersson@gmail.com", team: "Backpacking", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Börje Pettersson", familyId: "F042", phone: "0768070999", address: "Lönnviksvägen 10 B", email: "fam.b.pettersson@gmail.com", team: "Träningsresa", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Nina Pettersson", familyId: "F043", phone: "073513404", address: "Blomstervägen 29", email: "nina.l.pettersson@gmail.com", team: "Fjällvandring", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Linda Ryttlefors", familyId: "F044", phone: "0730488959", address: "Tornsvalevägen 4", email: "mats.ryttlefors@gmail.com", team: "Camping", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Mats Ryttlefors", familyId: "F044", phone: "0735303567", address: "Tornsvalevägen 4", email: "mats.ryttlefors@gmail.com", team: "Club 33", forratHost: "Ann-Carine Alm; Sigge Lind", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Monica Segelsjö", familyId: "F045", phone: "0705809144", address: "Granebergsvägen 18 C", email: "monica.segelsjoe@telia.com", dietary: "Nötter, mandel", team: "Charter", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Lena Jonsson; Jörgen Jonsson" },
  { name: "Olov Duvernoy", familyId: "F045", phone: "0708629307", address: "Granebergsvägen 18 C", email: "monica.segelsjoe@telia.com", team: "Träningsresa", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Ellen Stavbom", familyId: "F046", phone: "0761746467", address: "Havsörnsvägen 15", email: "tomas.stavbom@gmail.com", team: "Club 33", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Tomas Stavbom", familyId: "F046", phone: "0761482101", address: "Havsörnsvägen 15", email: "ellen.stavbom@hotmail.com", team: "Safari", forratHost: "Helena Pettersson; Börje Pettersson", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Christina Stenhammar", familyId: "F047", phone: "0708563694", address: "Ekolnsvägen 4C", email: "Christina.stenhammar@icloud.com", team: "Fjällvandring", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Katarina Börling; Marcus Börling" },
  { name: "Johan Stenhammar", familyId: "F047", phone: "0707106272", address: "Ekolnsvägen 4C", email: "johan@eduplanet.se", team: "Tågluff", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Hanna Söderberg", familyId: "F048", phone: "0733367649", address: "Rosenvägen 9A", email: "soderberghanna80@gmail.com", dietary: "Nötter, mandel, jordgubbar", team: "Kryssning", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Magnus Söderberg", familyId: "F048", phone: "0704855762", address: "Rosenvägen 9A", email: "magnus.soderberg78@gmail.com", team: "Camping", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Hanna Söderberg; Magnus Söderberg", efterrattHost: "Karin Eckerbom; Per Eckerbom" },
  { name: "Erika Terao", familyId: "F049", phone: "0703540115", address: "Tjädervägen 22", email: "erika_terao@hotmail.com", team: "Safari", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Ulrica Hedman; Peter Stenlund", efterrattHost: "Charlotte Gelin Bornudd; Mikael Gelin" },
  { name: "Peter Tedeholm", familyId: "F049", phone: "0703547037", address: "Tjädervägen 22", email: "tedeholm@hotmail.com", team: "Club 33", forratHost: "Malin Olsson; Tobias Norström", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Johanna Viring Till", familyId: "F050", phone: "0768187600", address: "Sunnerstavägen 12A", email: "johanna.viring@gmail.com", team: "Träningsresa", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Eva Hartman-Juhlin; Christopher Juhlin" },
  { name: "Robert Till", familyId: "F050", phone: "0708570538", address: "Sunnerstavägen 12A", email: "robert_till16@hotmail.com", team: "Backpacking", forratHost: "Marie Eklöf; Sven-Åke Eklöf", varmrattHost: "Cecilia Krona; Niclas Krona", efterrattHost: "Sara Blomberg; Magnus Blomberg" },
  { name: "Åsa Wallander Wetterqvist", familyId: "F051", address: "Entitevägen 5", email: "fredrik.wetterqvist@gmail.com", team: "Tågluff", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Fredrik Wetterqvist", familyId: "F051", phone: "0708898753", address: "Entitevägen 5", email: "fredrik.wetterqvist@gmail.com", team: "Club 33", forratHost: "Jenny Andersson Collby; Daniel Andersson Collby", varmrattHost: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Maria Öfverberg Eriksson", familyId: "F052", phone: "0768323654", address: "Höjdvägen 17", email: "poeriksson101@gmail.com", team: "Tågluff", forratHost: "Cecilia Olsson; Calle Håkansson", varmrattHost: "Monica Segelsjö; Olov Duvernoy", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "PO Eriksson", familyId: "F052", phone: "0706309278", address: "Höjdvägen 17", email: "maria@bluehillroad.com", team: "Club 33", forratHost: "Ingela Lennerstrand; Johan Lennerstrand", varmrattHost: "Anna Lidenholm; Håkan Lidenholm", efterrattHost: "Emma Julin; Michell Julin" },
  { name: "Oscar Diös", familyId: "F053", phone: "07067660", address: "Vårdsätravägen 182", email: "oscar@dios.nu", team: "Kryssning", forratHost: "Maria Hellman; Mats Hellman", varmrattHost: "Sofia Lernskog; Daniel Årvik", efterrattHost: "Anette Kravik; Micke Kravik" },
  { name: "Tomas Gunnarsson", familyId: "F054", address: "Doppingvägen 9", email: "guson@home.se", team: "Tågluff", forratHost: "Jenny Bexell; Marcus Lindholm", varmrattHost: "Marie Linton; Hans Linton", efterrattHost: "Lena Liljeström; Per Liljeström" },
  { name: "Tomas Vidinghoff", familyId: "F055", phone: "0733325235", address: "Ringduvevägen 6", email: "thomas.vidinghoff@gmail.com", team: "Tågluff", forratHost: "Ulrika Eriksson; Juppe Carlsson", varmrattHost: "Mari Kumlien; Svante Kumlien", efterrattHost: "Lena Liljeström; Per Liljeström" },
];

// ─── HOST ASSIGNMENTS ─────────────────────────────────────────────────────────
type HA = {
  hostNames: string; address: string; meal: string; pin: string;
  guests: string[]; // participant names (in seating order from PDF)
};

// Build dietary lookup from participant data
function getDietary(name: string): string | undefined {
  const p = PARTICIPANTS.find(p => p.name === name);
  return p?.dietary || undefined;
}

const FORRAT_HOSTS: HA[] = [
  { hostNames: "Ann-Carine Alm; Sigge Lind", address: "Blomstervägen 26", meal: "Förrätt", pin: "1001",
    guests: ["Cecilia Fernholm","Marie Linton","Cecilia Lund","Marie-Louise Mattsson","Tobias Ahlgren","Marcus Börling","Andreas Larsson","Per Mattsson","Mats Ryttlefors"] },
  { hostNames: "Cecilia Olsson; Calle Håkansson", address: "Åkervägen 46", meal: "Förrätt", pin: "1002",
    guests: ["Ulrica Hedman","Lena Liljeström","Christina Stenhammar","Maria Öfverberg Eriksson","Jörgen Jonsson","Håkan Lidenholm","David McGott","Johan Stenhammar"] },
  { hostNames: "Helena Pettersson; Börje Pettersson", address: "Lönnviksvägen 10 B", meal: "Förrätt", pin: "1003",
    guests: ["Linda Ahlgren","Eva Hartman-Juhlin","Milla Mohr","Linda Ryttlefors","Christopher Juhlin","Niclas Krona","Ronny Persson","Tomas Stavbom"] },
  { hostNames: "Ingela Lennerstrand; Johan Lennerstrand", address: "Höjdvägen 30B", meal: "Förrätt", pin: "1004",
    guests: ["Jenny Hedberg","Anna Hårdstedt","Ellen Stavbom","Johanna Viring Till","Peter Bohman","Olov Duvernoy","Tommy Enkvist","PO Eriksson"] },
  { hostNames: "Jenny Andersson Collby; Daniel Andersson Collby", address: "Pilfinksvägen 1", meal: "Förrätt", pin: "1005",
    guests: ["Stina Bohman","Cecilia Krona","Kajsa Lindner Bennbom","Erika Terao","Daniel Adwall","Christofer Ekstrand","Mathias Lindner","Mattias Lund","Fredrik Wetterqvist"] },
  { hostNames: "Jenny Bexell; Marcus Lindholm", address: "Ekvägen 6A", meal: "Förrätt", pin: "1006",
    guests: ["Katarina Börling","Charlotte Gelin Bornudd","Deborah McGott","Hanna Söderberg","Tomas Gunnarsson","Markus Haukkala","Micke Kravik","Matthias Mohr","Peter Stenlund"] },
  { hostNames: "Malin Olsson; Tobias Norström", address: "Gärdesvägen 5", meal: "Förrätt", pin: "1007",
    guests: ["Sara Blomberg","Lena Jonsson","Nina Pettersson","Monica Segelsjö","Per Eckerbom","Per Liljeström","Magnus Söderberg","Peter Tedeholm"] },
  { hostNames: "Maria Hellman; Mats Hellman", address: "Rödhakevägen 29C", meal: "Förrätt", pin: "1008",
    guests: ["Kajsa Bennbom Lindner","Carolina Björklund","Sabine Gebert Persson","Anette Kravik","Åsa Wallander Wetterqvist","Oscar Diös","Michell Julin","Svante Kumlien","Hans Linton"] },
  { hostNames: "Marie Eklöf; Sven-Åke Eklöf", address: "Krickvägen 46", meal: "Förrätt", pin: "1009",
    guests: ["Jennie Ekstrand","Emma Julin","Annika Kits","Anna Lidenholm","Marcus Andersson","Gustaf Björklund","Magnus Blomberg","Mikael Gelin","Robert Till"] },
  { hostNames: "Ulrika Eriksson; Juppe Carlsson", address: "Morkullevägen 23", meal: "Förrätt", pin: "1010",
    guests: ["Linda Adwall","Karin Eckerbom","Victoria Enkvist","Mari Kumlien","Sofia Lernskog","Mattias Lindner","LG Lundgren","Tomas Vidinghoff","Daniel Årvik"] },
];

const VARMRATT_HOSTS: HA[] = [
  { hostNames: "Anna Lidenholm; Håkan Lidenholm", address: "Talgoxvägen 7", meal: "Varmrätt", pin: "2001",
    guests: ["Cecilia Fernholm","Charlotte Gelin Bornudd","Nina Pettersson","Johanna Viring Till","Marcus Börling","PO Eriksson","Marcus Lindholm","Tobias Norström"] },
  { hostNames: "Cecilia Krona; Niclas Krona", address: "Rosenvägen 9B", meal: "Varmrätt", pin: "2002",
    guests: ["Stina Bohman","Jenny Hedberg","Maria Hellman","Ingela Lennerstrand","Daniel Andersson Collby","Christofer Ekstrand","Mats Hellman","Mathias Lindner","Robert Till"] },
  { hostNames: "Hanna Söderberg; Magnus Söderberg", address: "Rosenvägen 9A", meal: "Varmrätt", pin: "2003",
    guests: ["Linda Ahlgren","Ulrika Eriksson","Milla Mohr","Malin Olsson","Juppe Carlsson","Sven-Åke Eklöf","Jörgen Jonsson","Börje Pettersson"] },
  { hostNames: "Mari Kumlien; Svante Kumlien", address: "Fasanvägen 10B", meal: "Varmrätt", pin: "2004",
    guests: ["Linda Adwall","Sara Blomberg","Katarina Börling","Emma Julin","Anette Kravik","Per Eckerbom","Micke Kravik","Mattias Lindner","Tomas Vidinghoff"] },
  { hostNames: "Marie Linton; Hans Linton", address: "Rödhakevägen 27A", meal: "Varmrätt", pin: "2005",
    guests: ["Jennie Ekstrand","Deborah McGott","Ellen Stavbom","Christina Stenhammar","Mikael Gelin","Tomas Gunnarsson","Markus Haukkala","Matthias Mohr","Johan Stenhammar"] },
  { hostNames: "Monica Segelsjö; Olov Duvernoy", address: "Granebergsvägen 18 C", meal: "Varmrätt", pin: "2006",
    guests: ["Sabine Gebert Persson","Lena Liljeström","Linda Ryttlefors","Maria Öfverberg Eriksson","Magnus Blomberg","Christopher Juhlin","Johan Lennerstrand","David McGott","Mats Ryttlefors"] },
  { hostNames: "Sofia Lernskog; Daniel Årvik", address: "Rosenvägen 52", meal: "Varmrätt", pin: "2007",
    guests: ["Ann-Carine Alm","Jenny Andersson Collby","Carolina Björklund","Marie Eklöf","Anna Hårdstedt","Oscar Diös","Michell Julin","Andreas Larsson","Ronny Persson"] },
  { hostNames: "Ulrica Hedman; Peter Stenlund", address: "Klippvägen 4", meal: "Varmrätt", pin: "2008",
    guests: ["Jenny Bexell","Lena Jonsson","Kajsa Lindner Bennbom","Erika Terao","Daniel Adwall","Peter Bohman","Sigge Lind","Mattias Lund"] },
  { hostNames: "Victoria Enkvist; Tommy Enkvist", address: "Häckvägen 6C", meal: "Varmrätt", pin: "2009",
    guests: ["Karin Eckerbom","Cecilia Lund","Marie-Louise Mattsson","Tobias Ahlgren","Gustaf Björklund","Calle Håkansson","LG Lundgren","Per Mattsson"] },
  { hostNames: "Åsa Wallander Wetterqvist; Fredrik Wetterqvist", address: "Entitevägen 5", meal: "Varmrätt", pin: "2010",
    guests: ["Kajsa Bennbom Lindner","Eva Hartman-Juhlin","Annika Kits","Cecilia Olsson","Helena Pettersson","Marcus Andersson","Per Liljeström","Tomas Stavbom","Peter Tedeholm"] },
];

const EFTERRATT_HOSTS: HA[] = [
  { hostNames: "Anette Kravik; Micke Kravik", address: "Ekvägen 1", meal: "Efterrätt", pin: "3001",
    guests: ["Stina Bohman","Anna Hårdstedt","Marie-Louise Mattsson","Hanna Söderberg","Oscar Diös","Marcus Lindholm","Tobias Norström","Ronny Persson"] },
  { hostNames: "Charlotte Gelin Bornudd; Mikael Gelin", address: "Lyssnavägen 6", meal: "Efterrätt", pin: "3002",
    guests: ["Marie Eklöf","Annika Kits","Deborah McGott","Erika Terao","Mats Hellman","Johan Lennerstrand","Håkan Lidenholm","Mattias Lindner","Tomas Stavbom"] },
  { hostNames: "Emma Julin; Michell Julin", address: "Rälsvägen 21", meal: "Efterrätt", pin: "3003",
    guests: ["Jenny Bexell","Ulrica Hedman","Marie Linton","Ellen Stavbom","PO Eriksson","LG Lundgren","Mats Ryttlefors","Peter Tedeholm","Fredrik Wetterqvist"] },
  { hostNames: "Eva Hartman-Juhlin; Christopher Juhlin", address: "Svankärrsvägen 3B", meal: "Efterrätt", pin: "3004",
    guests: ["Jennie Ekstrand","Cecilia Krona","Milla Mohr","Johanna Viring Till","Daniel Andersson Collby","Olov Duvernoy","Per Mattsson","Börje Pettersson"] },
  { hostNames: "Karin Eckerbom; Per Eckerbom", address: "Blåhakevägen 42", meal: "Efterrätt", pin: "3005",
    guests: ["Jenny Andersson Collby","Sabine Gebert Persson","Anna Lidenholm","Linda Ryttlefors","Niclas Krona","Mattias Lund","David McGott","Magnus Söderberg"] },
  { hostNames: "Katarina Börling; Marcus Börling", address: "Jägarvägen 19", meal: "Efterrätt", pin: "3006",
    guests: ["Carolina Björklund","Maria Hellman","Cecilia Lund","Nina Pettersson","Christina Stenhammar","Juppe Carlsson","Christofer Ekstrand","Svante Kumlien","Sigge Lind"] },
  { hostNames: "Lena Jonsson; Jörgen Jonsson", address: "Skogsduvevägen 17 B", meal: "Efterrätt", pin: "3007",
    guests: ["Kajsa Bennbom Lindner","Jenny Hedberg","Kajsa Lindner Bennbom","Monica Segelsjö","Tobias Ahlgren","Sven-Åke Eklöf","Calle Håkansson","Daniel Årvik"] },
  { hostNames: "Lena Liljeström; Per Liljeström", address: "Jägarvägen 4", meal: "Efterrätt", pin: "3008",
    guests: ["Victoria Enkvist","Mari Kumlien","Cecilia Olsson","Åsa Wallander Wetterqvist","Maria Öfverberg Eriksson","Tomas Gunnarsson","Andreas Larsson","Johan Stenhammar","Tomas Vidinghoff"] },
  { hostNames: "Linda Adwall; Daniel Adwall", address: "Domherrevägen 15a", meal: "Efterrätt", pin: "3009",
    guests: ["Linda Ahlgren","Ulrika Eriksson","Ingela Lennerstrand","Malin Olsson","Marcus Andersson","Gustaf Björklund","Peter Bohman","Mathias Lindner","Hans Linton"] },
  { hostNames: "Sara Blomberg; Magnus Blomberg", address: "Ormvråksvägen 3", meal: "Efterrätt", pin: "3010",
    guests: ["Ann-Carine Alm","Cecilia Fernholm","Sofia Lernskog","Helena Pettersson","Tommy Enkvist","Markus Haukkala","Matthias Mohr","Peter Stenlund","Robert Till"] },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🧹 Clearing existing participant/host data...");
  await prisma.hostGuest.deleteMany();
  await prisma.hostAssignment.deleteMany();
  await prisma.participant.deleteMany();
  console.log("  ✓ Cleared");

  // Find existing teams (already seeded)
  console.log("🏷  Loading teams...");
  const teamMap: Record<string, string> = {};
  for (const name of TEAMS) {
    let t = await prisma.team.findFirst({ where: { name } });
    if (!t) {
      t = await prisma.team.create({ data: { name } });
    }
    teamMap[name] = t.id;
  }
  console.log(`  ✓ ${TEAMS.length} teams`);

  // Insert participants
  console.log("👥 Inserting 106 participants...");
  const firstNameCounts: Record<string, number> = {};
  for (const p of PARTICIPANTS) {
    // Build unique access code: familyId-firstName (lowercased, no spaces)
    const firstNameKey = p.name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = `${p.familyId.toLowerCase()}-${firstNameKey}`;
    firstNameCounts[key] = (firstNameCounts[key] || 0) + 1;
    const suffix = firstNameCounts[key] > 1 ? `-${firstNameCounts[key]}` : "";
    const accessCode = `${key}${suffix}`;

    await prisma.participant.create({
      data: {
        name: p.name,
        teamId: teamMap[p.team],
        phone: p.phone || null,
        address: p.address || null,
        dietary: p.dietary || null,
        confirmed: true,
        forratHost: p.forratHost,
        varmrattHost: p.varmrattHost,
        efterrattHost: p.efterrattHost,
        accessCode,
        role: "guest",
      },
    });
  }
  console.log(`  ✓ ${PARTICIPANTS.length} participants`);

  // Insert host assignments
  console.log("🏠 Inserting host assignments...");
  const allHosts = [...FORRAT_HOSTS, ...VARMRATT_HOSTS, ...EFTERRATT_HOSTS];
  for (const ha of allHosts) {
    await prisma.hostAssignment.create({
      data: {
        pin: ha.pin,
        hostNames: ha.hostNames,
        address: ha.address,
        meal: ha.meal,
        type: "meal",
        guests: {
          create: ha.guests.map(guestName => ({
            participantName: guestName,
            dietary: getDietary(guestName) || null,
          })),
        },
      },
    });
  }
  console.log(`  ✓ ${allHosts.length} host assignments (${FORRAT_HOSTS.length} förrätt, ${VARMRATT_HOSTS.length} varmrätt, ${EFTERRATT_HOSTS.length} efterrätt)`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
