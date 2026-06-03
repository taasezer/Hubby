import os
from openai import OpenAI
from pydantic import BaseModel

# Requires OPENAI_API_KEY to be set in environment
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy-key"))

class AIEvaluationResult(BaseModel):
    score: int
    feedback: str
    action_item: str

def evaluate_task_progress(task_title: str, task_status: str, assignee_name: str = "Atanmamış") -> AIEvaluationResult:
    """
    Yapay zekaya görevi gönderip değerlendirmesini ve tavsiye vermesini sağlar.
    """
    if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "your-openai-api-key":
        # Mock result if no API key is provided yet
        return AIEvaluationResult(
            score=85,
            feedback="AI API anahtarı eklenmediği için örnek değerlendirme sunuluyor. Görev durumu iyi görünüyor.",
            action_item="OPENAI_API_KEY değerini .env dosyasına ekleyin."
        )

    system_prompt = (
        "Sen 'Hubby' adlı geliştirici işbirliği platformunun Kıdemli Proje Yöneticisi AI'sın. "
        "Amacın ekibin üzerinde çalıştığı görevleri analiz etmek, kalite/ilerleme puanı (0-100 arası) vermek "
        "ve onları bir sonraki adıma yönlendiren yapıcı geri bildirimler sunmaktır. "
        "Yanıtın her zaman katı bir JSON formatında olmalıdır."
    )

    user_prompt = (
        f"Lütfen şu görevi analiz et:\n"
        f"Görev Adı: {task_title}\n"
        f"Durumu: {task_status}\n"
        f"Atanan Kişi: {assignee_name}\n\n"
        "Lütfen bana aşağıdaki JSON formatında dön:\n"
        "{\n"
        '  "score": (0 ile 100 arası bir tamsayı),\n'
        '  "feedback": "Görev hakkındaki kısa ve profesyonel yorumun",\n'
        '  "action_item": "Yapılması gereken bir sonraki en önemli somut adım"\n'
        "}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Hızlı ve uygun maliyetli model
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        
        result_str = response.choices[0].message.content
        import json
        result_json = json.loads(result_str)
        
        return AIEvaluationResult(
            score=int(result_json.get("score", 0)),
            feedback=str(result_json.get("feedback", "Değerlendirme yapılamadı.")),
            action_item=str(result_json.get("action_item", "Lütfen tekrar kontrol edin."))
        )
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return AIEvaluationResult(
            score=0,
            feedback=f"Yapay zeka değerlendirmesi sırasında bir hata oluştu: {str(e)}",
            action_item="Hata günlüklerini (logs) kontrol edin."
        )

def generate_task_roadmap(project_context: str, team_members: list) -> list:
    """
    Yapay zekaya projenin amacını ve takım üyelerini (yetenekleri ile) gönderip
    bir görev yol haritası oluşturmasını sağlar.
    """
    if not os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY") == "your-openai-api-key":
        return [
            {"title": "Proje kurulumunu yapın", "description": "Temel ortam kurulumu", "priority": "high", "assignee_id": None},
            {"title": "Veritabanı şemasını tasarlayın", "description": "Tabloları ve ilişkileri belirleyin", "priority": "medium", "assignee_id": None}
        ]

    system_prompt = (
        "Sen 'Hubby' geliştirici platformunun Baş Yazılım Mimarı ve Çevik (Agile) Proje Yöneticisisin. "
        "Kullanıcının proje hedeflerine ve takım üyelerinin yetenek havuzuna göre mantıksal bir görev (task) yol haritası oluşturman gerekiyor. "
        "Her görev için bir başlık, açıklama, öncelik düzeyi (high, medium, low) ve eğer yetenekleri uyuyorsa en uygun takım üyesinin ID'sini seçmelisin. "
        "Eğer uygun kimse yoksa assignee_id değerini null yap. "
        "Yanıtın her zaman { \"tasks\": [ ... ] } şeklinde katı bir JSON formatında olmalıdır."
    )

    team_context = "\nTakım Üyeleri:\n"
    for member in team_members:
        team_context += f"- ID: {member.get('user_id')} | İsim: {member.get('full_name')} | Rol: {member.get('role')} | Yetenekler: {', '.join(member.get('skills') or [])}\n"

    user_prompt = (
        f"Lütfen şu proje için bir görev yol haritası oluştur:\n"
        f"Proje Özeti: {project_context}\n"
        f"{team_context}\n\n"
        "Lütfen bana aşağıdaki JSON formatında dön:\n"
        "{\n"
        '  "tasks": [\n'
        '    {\n'
        '      "title": "Görev adı",\n'
        '      "description": "Görev açıklaması",\n'
        '      "priority": "high",\n'
        '      "assignee_id": "user-uuid veya null"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        
        result_str = response.choices[0].message.content
        import json
        result_json = json.loads(result_str)
        
        return result_json.get("tasks", [])
    except Exception as e:
        print(f"OpenAI Error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"OpenAI Hatası: {str(e)}")
