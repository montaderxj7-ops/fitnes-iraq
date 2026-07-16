const fs = require('fs');

async function testGemini() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const keyMatch = envFile.match(/GEMINI_API_KEY="(.*?)"/);
  if (!keyMatch) {
    console.error("No key found");
    return;
  }
  const apiKey = keyMatch[1];

  const ingredients = [{ name: 'صدر دجاج', amount: 100 }, { name: 'ارز', amount: 100 }];
  const prompt = `
أنت خبير تغذية وحاسبة ماكروز. 
لدي قائمة بالمكونات التالية، مع الكمية بالجرام لكل مكون.
أريدك أن تحسب السعرات الحرارية، البروتين، الكربوهيدرات، والدهون لكل مكون في هذه القائمة بناءً على الكمية المعطاة.

المكونات:
${ingredients.map((ing, i) => `${i + 1}. ${ing.name} - ${ing.amount} جرام`).join("\n")}

يجب أن يكون الرد الخاص بك بصيغة JSON فقط يحتوي على مصفوفة (Array) بنفس الترتيب، بحيث يكون كل عنصر عبارة عن كائن (Object) يحتوي على الأرقام فقط (بدون أي نصوص إضافية) للخصائص التالية:
[
  {
    "calories": 150,
    "protein": 30.5,
    "carbs": 0,
    "fats": 3.2
  }
]
لا تُرجع أي نص آخر، فقط مصفوفة الـ JSON.
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    console.error("Gemini API Error:", response.status, await response.text());
    return;
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testGemini();
