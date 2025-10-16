import "dotenv/config";
import { auth } from "../src/lib/auth";

const employees = [
	{ name: "VIGNESH.N.S", email: "vigneshsravanthi9966@gmail.com" },
	{ name: "VISHNUVARADHAN.N", email: "vishnuvaradhan.@gmail.com" },
	{ name: "RAMALINGAM.R", email: "ramalingamsvtm@gmail.com" },
	{ name: "ANANTHAN.R", email: "anant@vasavi.com" },
	{ name: "HARIHARAN.T.R", email: "hariharish2607@gmail.com" },
	{ name: "KARTHIK.J", email: "srikarthikj01@gmail.com" },
	{ name: "MAHENDRAN.E", email: "emahendran1975@gmail.com" },
	{ name: "SEKAR.N", email: "sekar@vasavi.com" },
	{ name: "KARTHIKEYAN.J", email: "j.karthik1206@gmail.com" },
	{ name: "SARAVANA KUMAR.N", email: "saravanakumarsvtm@gmail.com" },
	{ name: "BRINDHA.S", email: "kumaranbk37@gmail.com" },
	{ name: "SAKILA", email: "sak@vasavi.com" },
	{ name: "N.S SIVA", email: "sivavignesh624@gmail.com" },
	{ name: "SARAVANAN SUBBURAMANI", email: "sarav@vasavisubburamani.com" },
	{ name: "SAMPAVI DEVI", email: "sampavi.devi@svtmjewels.com" },
	{ name: "JANAKIRAMAN.V", email: "janak@vasavi.com" },
	{ name: "BALAMURUGAN.V", email: "bm674407@gmail.com" },
	{ name: "SIVAKUMAR.P.E.R", email: "siva77785@gmail.com" },
	{ name: "SHEELA ROSE MARY.A", email: "sheelarosemary700@gmail.com" },
	{ name: "Nirmala", email: "nirmala32@svtmjewels.com" },
	{ name: "V KUMAR", email: "kv23180@gmail.com" },
	{ name: "SRINIVASAN", email: "srini@vasavi.com" },
	{ name: "SURESH.S", email: "suresh2561966@gmail.com" },
	{ name: "S.M.SIVAKUMAR", email: "sivakumar16371@gmail.com" },
	{ name: "MAHESHWARI.R", email: "maheshwari562003@gmail.com" },
	{ name: "S SURESH", email: "sureshrenugadevi20@gmail.com" },
	{ name: "DEVIKA.S", email: "devikaa2001199@gmail.com" },
	{ name: "RAMESH", email: "rameshpadma.rp@gmail.com" },
	{ name: "R MARIAPPAN", email: "mariyappandgl464@gmail.com" },
	{ name: "KALAIVANI.S", email: "kalaivanikalaivani036@gmail.com" },
	{ name: "PANDIAN.R", email: "rpandian950@gmail.com" },
	{ name: "MURALI.K.M", email: "murali.km441@gmail.com" },
	{ name: "SATHISH KUMAR.M", email: "sathishkumar491985@gmail.com" },
	{ name: "R VENKATESAN", email: "venkatesan1972vtm@gmail.com" },
	{ name: "SANGEETHA.M", email: "sangeethamookan@gmail.com" },
	{ name: "Renu", email: "dgm@svtmjewels.com" },
	{ name: "Rathakrishnan Balsamy", email: "ratha@vasavibalsam.com" },
	{ name: "VAISHNAVY.NS", email: "vaishnavy651@gmail.com" },
	{ name: "KRISHNAMOORTHY.A", email: "beenakittu83@gmail.com" },
	{ name: "Mohan Vengatachalapathi", email: "mohanrenuga55333@gmail.com" },
	{ name: "RADHIKA.M", email: "radhikadgl1991@gmail.com" },
	{ name: "G.Thangavel", email: "thangavelc421@gmail.com" },
	{ name: "ARUNKUMAR", email: "arunkumarkannan3112@gmail.com" },
	{ name: "V.DHANALAKSHMI", email: "srilakshmivenkatesh22@gmail.com" },
	{ name: "R.SENTHILBABU", email: "rsenthilbabu1984@gmail.com" },
	{ name: "A BHUVANESHKUMAR", email: "bhuvaneshkumara7@gmail.com" },
	{ name: "RAJENDRAN", email: "rajendran@svtmjewels.com" },
	{ name: "JENIBA MALAR KODI", email: "jenib@vasavimalarkodi.com" },
	{ name: "SANGEETHA.G", email: "sangeethagvnb@gmail.com" },
	{ name: "RAVIMURUGAN.A", email: "ravim@vasavi.com" },
	{ name: "BALAMURUGAN.K", email: "balamurugan16051990@gmail.com" },
	{ name: "Chinnachamy.", email: "vchinnachamy1976@gmail.com" },
	{ name: "J.GOPI", email: "gopigb1109@gmail.com" },
	{ name: "SUDHA.N", email: "ssudha1362@gmail.com" },
	{ name: "VASANTHAN.R", email: "vasan@vasavi.com" },
	{ name: "ROOBA.T", email: "rooparajeshkanna@gmail.com" },
	{ name: "SATHISH", email: "sathish90437@gmail.com" },
	{ name: "BALASUBRAMANIYAN.N", email: "balasvtm@gmail.com" },
	{ name: "SAROJA", email: "saroja@vasavi.com" },
	{ name: "DURGA.M", email: "durga@vasavi.com" },
	{ name: "YOGESH KUMAAR.B", email: "yogeshkumaar762@gmail.com" },
	{ name: "PREMKUMAR", email: "hr@svtmjewels.com" },
	{ name: "RASIKALA.M", email: "rasik@vasavi.com" },
	{ name: "MUTHAMILSELVAN", email: "smuthamil239@gmail.com" },
	{ name: "BALAKRISHNAN.K", email: "balakrishnanb558@gmail.com" },
	{ name: "V SIVABABU", email: "sivababu280880@gmail.com" },
	{ name: "S VIJAYALAKSHMI", email: "vij@vasavi.com" },
	{ name: "R.VENGATESH", email: "r.ven@vasavi.com" },
	{ name: "D.SELVARAJ", email: "selva9323@gmail.com" },
	{ name: "K PANDIYAMMAL", email: "mkaruppiah123@gmail.com" },
	{ name: "S SHANMUGASUNDARI", email: "ssshanmusundari1852@gmail.com" },
	{ name: "THANALAKSHMI.K", email: "pandisivak24@gmail.com" },
	{ name: "VENKATESH.S", email: "venka@vasavi.com" },
	{ name: "ANANDHA JOTHI", email: "jothinishanth993@gmail.com" },
	{ name: "RAMEELA RAGAVI", email: "nvkchandrasekaran@gmail.com" },
	{ name: "S SRIRENGANAYAKI", email: "anupriya@gmail.com" },
	{ name: "S KALAISELVI", email: "skal@vasavi.com" },
	{ name: "MUTHUMARI.M", email: "gokulganesh2006gk@gmail.com" },
	{ name: "JEYAPRAKASH.B", email: "jeyjeyaprakash555@gmail.com" },
	{ name: "SEKAR", email: "sekars@vasavi.com" },
	{ name: "Cithra", email: "k.cit@vasavi.com" },
	{ name: "BRINDHA.S", email: "brind@vasavi.com" },
	{ name: "MAHA LAKSHMI", email: "mahalakshmi@gmail.com" },
	{ name: "DIVYA BHARATHI", email: "divyadiya1425@gmail.com" },
	{ name: "BALAMANI", email: "balamani@svtmjewels.com" },
	{ name: "VINAYAGAN", email: "n.vinayagan@gmail.com" },
	{ name: "DIVYA.S", email: "riyoaro16@gmail.com" },
	{ name: "D.SIVARANJANI", email: "srdhanus2019@gmail.com" },
	{ name: "AMALA SELVI.J", email: "johnbasco1971psnact@gmail.com" },
	{ name: "M SAROJA", email: "sar@vasavi.com" },
	{ name: "M MUTHUMARI", email: "muthumari1122000@gmail.com" },
	{ name: "ARUNACHALAM.N", email: "arunachalam6700@gmail.com" },
	{ name: "Velmurugan", email: "rockvel8056@gmail.com" },
	{ name: "ALAMELU.P", email: "alame@vasavi.com" },
	{ name: "KRISHNAN.V", email: "krish@vasavi.com" },
	{ name: "PANDI MEENA.M", email: "maruthamuthu0282@gmail.com" },
	{ name: "INDIRANI SURESH", email: "sinderani1984@gmail.com" },
	{ name: "MANEESHWARI.K", email: "kmaneeshwari@gmail.com" },
	{ name: "INDHURANI", email: "indhu@vasavi.com" },
	{ name: "M.MURUGESAN", email: "m.mur@vasavi.com" },
	{ name: "HARIKUMAR GUNASEKARAN", email: "harigmh2209@gmail.com" },
	{ name: "MOTHILAL", email: "mothi@vasavi.com" },
	{ name: "GANESAN", email: "ganeshmechdgl@gmail.com" },
	{ name: "PANDIAMMAL.P", email: "pandi@vasavil.com" },
	{ name: "BALA MURUGAN.K", email: "bala@vasavimurugan.com" },
	{ name: "KARTHICK", email: "karthickv1489@gmail.com" },
	{ name: "MANIKANDAN KARUNAKARAN", email: "manikandan01061991@gmail.com" },
	{ name: "PRABA", email: "prabamanikandan123@gmail.com" },
	{ name: "SOUNDHARAYA KUMARASAN", email: "soundraya09101999@gmail.com" },
	{ name: "LOGESHWARAN RAVI", email: "logeshwaran@svtmjewels.com" },
	{ name: "GOPINATHAN GOVINDA NAYAR", email: "gopi@svtmjewels.com" },
	{ name: "DHASPIKA", email: "daspihabanu@gmail.com" },
	{ name: "EUGINE SAHAYARAJ.J", email: "ugindgl@gmail.com" },
	{ name: "INBARAJ.Y", email: "inbam87@gmail.com" },
	{ name: "PAPPULAKSHMI.A", email: "guhananu9@gmail.com" },
	{ name: "Sudha Natarajan", email: "sudha@vasavinataraja.com" },
	{ name: "SUJITHA.A", email: "sujitha.3196@gmail.com" },
	{ name: "PUNITHA.R", email: "punitharb1999@mail.com" },
	{ name: "NANDHINI VEERAMANI", email: "nandhinivamsik@gmail.com" },
	{ name: "PANCHU.B", email: "suthangiri9@gmail.com" },
	{ name: "SURYA PRAKASH.K", email: "suryaprakash15092002@gmail.com" },
	{ name: "SUBASHINI SUBIRAMANI", email: "subas@vasavisubburamani.com" },
	{ name: "KAMALAKANNAN.T", email: "kamalakannan8925@gamil.com" },
	{ name: "KARTHIKEYAN.M", email: "karthikeyan0327@gmail.com" },
	{ name: "RAJESHWARI.P", email: "kamatchimathavan5@gmail.com" },
	{ name: "R GAYATHRI", email: "gayathrigayuammu875@gmail.com" },
	{ name: "SAKTHI SUBRAMANI.T", email: "sakth@vasavisubraman.com" },
	{ name: "JEYAKRISHNA MOORTHI.R", email: "videoshop.svtmjewels@gmail.com" },
	{ name: "VIJAYALAKSHMI.R", email: "vijay@vasavi.com" },
	{ name: "SARAVANAN", email: "sharvandgl88@gmail.com" },
	{
		name: "DHANDAYUTHABANI DHARMALINGAM",
		email: "dhandayuthabani23@gmail.com",
	},
	{ name: "VIMALA MUNISAMY", email: "vimal@vasavimunisam.com" },
	{ name: "VEERAMMAL.R", email: "veera@vasavi.com" },
	{ name: "B.Kumaresan", email: "b.kum@vasavi.com" },
	{
		name: "MUTHUMANIVEL KAJENDRAN",
		email: "kmuthumanivelkmuthumani@gmail.com",
	},
	{ name: "K SUBBAIYA", email: "ksub@vasavi.com" },
	{ name: "G Amutha", email: "amuthabi28@gmail.com" },
	{ name: "Iswariya Renganathan", email: "iiswarya215@gmail.com" },
	{ name: "BALAMURUGAN.N", email: "balam@vasavi.com" },
	{ name: "MOHAMED ISHAK.J", email: "ishak904675@gmail.com" },
	{ name: "GANESAN.A", email: "ganes@vasavi.com" },
	{ name: "NAGARAJAN.K", email: "nagar@vasavi.com" },
	{ name: "MOHAN.S", email: "mohan@vasavi.com" },
	{ name: "PARTHIPAN.V", email: "parth@vasavi.com" },
	{ name: "NEHRU.K", email: "nehru@vasavi.com" },
	{ name: "MUNISAMY.G", email: "munis@vasavi.com" },
	{ name: "PALANISAMY", email: "tpal@vasavi.com" },
	{ name: "SATHISH KUMAR.J", email: "satheesh081984@gmail.com" },
	{ name: "SATHISHKUMAR.S", email: "skl2782001@gmail.com" },
	{ name: "CHINNAMMAL.K", email: "thanalakshmik24@gmail.com" },
	{ name: "NITHYA", email: "saravananithya90@gmail.com" },
	{ name: "SEKAR.K", email: "ksekar21267@gmail.com" },
	{ name: "Mathiyalagan", email: "mathiyalagan911@gmail.com" },
	{ name: "RAMYA.G", email: "ramyag310803@gmail.com" },
	{ name: "RENUGA NALLATHAMBI", email: "renugadass1044@gmail.com" },
	{ name: "MURUGAVALLI.A", email: "murugavalli@vasavi.com" },
	{ name: "Mahalakshmi Selvam", email: "mahal@vasaviselvam.com" },
	{ name: "KANJANA", email: "kanja@vasavi.com" },
	{
		name: "VIDHYA LAKSHMI MURUGESAN",
		email: "vidhyalakshmimurugesan@gmail.com",
	},
	{ name: "Chithambaram Pillai", email: "chith@vasavipillai.com" },
	{ name: "Mahalingam Subbaiya", email: "mahal@vasavisubbaiya.com" },
	{ name: "PHILOMINAL MARY", email: "mary2872001@gmail.com" },
	{ name: "HARSITHA SATHISKUMAR", email: "harsithaharsi2@gamil.com" },
	{ name: "Lakshmi Santharam", email: "laksh@vasavisanthara.com" },
	{ name: "MANIMEGALAI.S", email: "smanipriya15@gmail.com" },
	{ name: "MANOGARI", email: "manodharshini276@gmail.com" },
	{ name: "KUGAPRIYA.R", email: "kugappriyakugappriya@gmail.com" },
	{ name: "SHARMILA.J", email: "sharmilokethaloketha@gmail.com" },
	{ name: "SENTHIL KUMAR SUBRAMANIAN", email: "senth@vasavisubburamanian.com" },
	{ name: "Kamali Murugan", email: "arunkamali961@gmail.com" },
	{ name: "Karthika Seenivasan", email: "maniriya861@gmail.com" },
	{ name: "MAHALAKSHMI PANDIYAN", email: "ml1911075@gmail.com" },
	{ name: "SUGANYA DEVI", email: "suganyadevibalamurugan@gmail.com" },
	{ name: "PANDI MEENA.K", email: "meenapandi1023@gmail.com" },
	{ name: "VARSHINI MANIKANDAN", email: "varshini430@gmail.com" },
	{ name: "JAYARAMAN VENKATAJALAPATHY", email: "kempsjraman@gmail.com" },
	{ name: "RATHIKA", email: "rpsakthisree@gmail.com" },
	{ name: "Yogesh Varatharaj", email: "yogeshvaratharaj006@gmail.com" },
	{ name: "GOKILA DINAKARAN", email: "gokil@vasavidinakaran.com" },
	{ name: "SARANYA.S", email: "saran@vasavi.com" },
	{ name: "ABIRAMI", email: "rockstarabiram97@gmail.com" },
	{ name: "SHYAMALA", email: "shyam@vasavi.com" },
	{ name: "DONALD REEGAN.R", email: "donaldreegan1809@gmail.com" },
	{ name: "RANJITH KUMAR", email: "ranjith@svtmjewels.com" },
	{ name: "Vasuki Manokaran", email: "vasuki9327@gmail.com" },
	{ name: "JEYALAKSHMI", email: "selvamjeya494@gmail.com" },
	{ name: "SANTHIYAGU SALOMINAL", email: "salominal@svtm.com" },
	{ name: "V.MURALIRAJA", email: "muraliraja1327@gmail.com" },
	{ name: "Mothilal", email: "amothilal1981@gmail.com" },
	{ name: "HARSHITHA", email: "harshithamanjunath771@gmail.com" },
	{ name: "ELAVARASI", email: "melavarasy861@gmail.com" },
	{ name: "NAGARANI", email: "bhagavathis099@gmail.com" },
	{ name: "JACQULINE SAHAYA SELVI", email: "jacksaran84@gmail.com" },
	{ name: "DEEPAK", email: "dpknar52@gmail.com" },
	{ name: "MUTHURAJA", email: "muthuraja25121998@gmail.com" },
	{ name: "NIVETHA", email: "nivimeenu@gmail.com" },
	{ name: "ARUNA DEVI", email: "aruna.devi@svtmjewels.com" },
	{ name: "MANO BALAJI", email: "dkmanobalaji@gmail.com" },
	{ name: "SARATH KUMAR", email: "sarathssk1234@gmail.com" },
	{ name: "VINOTHINI", email: "vinosenthil145@gmail.com" },
	{ name: "PADMAVATHI", email: "svtm515@gmail.com" },
	{ name: "SUBBURAM", email: "svtm517@gmail.com" },
	{ name: "PADMINI", email: "svtm520@gmail.com" },
	{ name: "PIDARI", email: "svtm521@gmail.com" },
	{ name: "STELLA MARY", email: "svtm522@gmail.com" },
	{ name: "Anushiya", email: "anushiya0164@gmail.com" },
	{ name: "Manimegalai", email: "svtm526@gmail.cocm" },
	{ name: "Kalaivani", email: "kalaimithru@gmail.com" },
	{ name: "SANKAR RAJA", email: "sankarajith052@gmail.com" },
	{ name: "Lakshmi Krishnan", email: "lakshmi@gmail.com" },
	{ name: "PANJAVARNAM", email: "panja@vasavi.com" },
	{ name: "BALA KANNAN", email: "balakannan.g.1958@gmail.com" },
	{ name: "MURUGESAN.S", email: "murug@vasavi.com" },
	{ name: "SARAVANABABU.T", email: "sarav@vasavit.com" },
	{ name: "MARUTHAI.P", email: "marut@vasavi.com" },
	{ name: "JEGATHEESAN.K", email: "jegat@vasavi.com" },
	{ name: "ANANDRAJ.J", email: "anand@vasavi.com" },
];

const DEFAULT_PASSWORD = "Employee@2025";

async function seedUsers() {
	try {
		console.log("🌱 Starting to create users with Better Auth...\n");

		let successCount = 0;
		let failureCount = 0;
		const failedUsers: string[] = [];

		for (const employee of employees) {
			try {
				await auth.api.signUpEmail({
					body: {
						email: employee.email,
						password: DEFAULT_PASSWORD,
						name: employee.name,
					},
				});

				console.log(`✅ Created user: ${employee.email}`);
				successCount++;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);

				// Check if it's a duplicate email error
				if (
					errorMessage.includes("unique") ||
					errorMessage.includes("already exists") ||
					errorMessage.includes("email")
				) {
					console.log(`⚠️  User already exists: ${employee.email}`);
				} else {
					console.error(
						`❌ Failed to create user ${employee.email}:`,
						errorMessage,
					);
					failedUsers.push(employee.email);
					failureCount++;
				}
			}
		}

		console.log("\n" + "=".repeat(50));
		console.log("📊 Seed Summary:");
		console.log(`✅ Successfully created: ${successCount} users`);
		console.log(`❌ Failed: ${failureCount} users`);

		if (failedUsers.length > 0) {
			console.log("\n❌ Failed users:");
			failedUsers.forEach((email) => {
				console.log(`  - ${email}`);
			});
		}

		console.log("=".repeat(50));
		console.log("✨ User creation completed!");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

seedUsers();
