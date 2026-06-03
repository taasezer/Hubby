import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Mevcut uygulamamızı import ediyoruz
from main import app
from dependencies import get_current_user

# Yetkilendirmeyi (Auth) atlatmak için sahte (mock) kullanıcı
def override_get_current_user():
    return {"id": "user-uuid", "email": "test@hubby.local"}

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

class TestHubbyBackend(unittest.TestCase):
    
    def test_health_check(self):
        """Uygulamanın temel olarak ayakta olup olmadığını test eder."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    @patch('routers.projects.get_supabase')
    def test_project_endpoints(self, mock_get_supabase):
        """Veritabanı bağlantısını taklit (mock) ederek Proje CRUD işlemlerini teorik olarak test eder."""
        # Supabase istemcisini ve zincirleme (chained) metodlarını taklit et
        mock_sb = MagicMock()
        mock_get_supabase.return_value = mock_sb
        
        # POST /projects (Create) için sahte veri dönüşü
        mock_sb.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": "proj-123", "name": "Hubby Test Projesi", "user_id": "user-uuid"}
        ]
        
        response = client.post("/projects/", json={"user_id": "user-uuid", "name": "Hubby Test Projesi"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["name"], "Hubby Test Projesi")
        
        # GET /projects (Read) için sahte veri dönüşü (Zincire .eq eklendi)
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "proj-123", "name": "Hubby Test Projesi"}
        ]
        
        response_get = client.get("/projects/")
        self.assertEqual(response_get.status_code, 200)
        self.assertTrue(len(response_get.json()["data"]) > 0)

    @patch('routers.tasks.evaluate_task_progress')
    @patch('routers.tasks.get_supabase')
    def test_ai_evaluation_endpoint(self, mock_get_supabase, mock_ai_eval):
        """OpenAI ve Supabase'i taklit ederek '/tasks/evaluate' mantığının doğru çalışıp çalışmadığını test eder."""
        mock_sb = MagicMock()
        mock_get_supabase.return_value = mock_sb
        
        # Veritabanından görev çekiliyormuş gibi davran
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{
            "id": "task-123", 
            "title": "Login UI Kodlaması", 
            "status": "in_progress",
            "assignee_id": "user-1",
            "profiles": {"full_name": "Taha Sezer"}
        }]
        
        # OpenAI API'sine istek atmak yerine yapay zekanın döneceği cevabı taklit et
        mock_ai_result = MagicMock()
        mock_ai_result.score = 92
        mock_ai_result.feedback = "Kod mimarisi çok iyi görünüyor."
        mock_ai_result.action_item = "Birim testlerini (unit test) yazmaya başlayın."
        mock_ai_eval.return_value = mock_ai_result
        
        # Endpoint'i çağır
        response = client.post("/tasks/evaluate", json={"task_id": "task-123"})
        
        # Test: İstek başarılı oldu mu?
        self.assertEqual(response.status_code, 200)
        # Test: AI skoru JSON formatında doğru iletildi mi?
        self.assertEqual(response.json()["evaluation"]["score"], 92)
        # Test: AI tavsiyesi doğru iletildi mi?
        self.assertEqual(response.json()["evaluation"]["action_item"], "Birim testlerini (unit test) yazmaya başlayın.")
        
        # Test: Veritabanında (Supabase) Güncelleme (Update) fonksiyonu çağrıldı mı? (Sistemin çalıştığının kanıtı)
        mock_sb.table.return_value.update.assert_called()
        # Test: Bildirim (Notification) oluşturma fonksiyonu çağrıldı mı?
        mock_sb.table.return_value.insert.assert_called()

if __name__ == "__main__":
    unittest.main(verbosity=2)
