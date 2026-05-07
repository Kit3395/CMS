from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_resident_import_summary_and_errors():
    csv_data = """name,email,phase,block,lot
John Doe,john@example.com,1,A,10
,missingname@example.com,1,A,11
Jane Doe,invalid-email,2,B,12
"""
    files = {"file": ("residents.csv", csv_data, "text/csv")}
    res = client.post("/imports/residents", files=files, headers={"x-role": "Admin"})
    assert res.status_code == 200
    payload = res.json()
    assert payload["total_rows"] == 3
    assert payload["success_rows"] == 1
    assert payload["error_rows"] == 2
    assert "job_id" in payload
