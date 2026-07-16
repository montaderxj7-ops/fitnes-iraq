"use server";

export async function calculateMacrosAction(ingredients: { name: string; amount: number }[]) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "لم يتم تكوين مفتاح Gemini API." };
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini API Error:", await response.text());
      return { success: false, error: "فشل في جلب البيانات من الذكاء الاصطناعي." };
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      return { success: false, error: "استجابة غير متوقعة من الذكاء الاصطناعي." };
    }

    try {
      const macros = JSON.parse(textResult);
      if (!Array.isArray(macros)) {
        return { success: false, error: "تنسيق الرد غير صحيح." };
      }
      return { success: true, macros };
    } catch (e) {
      return { success: false, error: "فشل في تحليل بيانات الذكاء الاصطناعي." };
    }

  } catch (error) {
    console.error(error);
    return { success: false, error: "حدث خطأ غير متوقع." };
  }
}
