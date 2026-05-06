INSERT INTO users (id,email,password_hash,full_name,role,is_active) VALUES
(1,'admin@cms.local','$2b$dummy','System Admin','admin',true),
(2,'resident1@cms.local','$2b$dummy','Ava Resident','resident',true),
(3,'manager@cms.local','$2b$dummy','Mason Manager','manager',true);

INSERT INTO residents (id,user_id,unit_number,lease_start_date,lease_end_date,phone) VALUES
(100,2,'B-204','2026-01-01','2026-12-31','+1-555-0101');

INSERT INTO invoices (id,resident_id,invoice_number,issue_date,due_date,subtotal,tax_amount,total_amount,balance_due,status,notes) VALUES
(1000,100,'INV-2026-0001','2026-05-01','2026-05-15',1200.00,0.00,1200.00,600.00,'partial','May rent');

INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,line_total) VALUES
(1100,1000,'Base rent',1.00,1200.00,1200.00);

INSERT INTO payments (id,invoice_id,resident_id,amount,method,transaction_reference) VALUES
(1200,1000,100,600.00,'ach','TRX-ACH-001');

INSERT INTO receipts (id,payment_id,receipt_number,document_url) VALUES
(1300,1200,'RCP-2026-0001','https://example.com/receipts/RCP-2026-0001.pdf');

INSERT INTO disputes (id,invoice_id,resident_id,opened_by_user_id,reason,status) VALUES
(1400,1000,100,2,'Question about late fee line item.','open');

INSERT INTO notifications (id,user_id,channel,subject,message,sent_at) VALUES
(1500,2,'email','Invoice issued','Your May invoice is now available.',now());

INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,metadata) VALUES
(1600,1,'create_invoice','invoice',1000,'{"source":"seed"}');

INSERT INTO system_settings (key,value,description) VALUES
('currency','{"code":"USD","symbol":"$"}','Default currency'),
('late_fee_policy','{"grace_days":5,"flat_fee":35}','Late fee policy');

INSERT INTO announcements (id,title,body,starts_at,ends_at,created_by_user_id) VALUES
(1700,'Pool Maintenance','Pool will be closed this weekend.','2026-05-07 08:00:00+00',NULL,3);

INSERT INTO import_jobs (id,requested_by_user_id,source_filename,status,total_rows,success_rows,failed_rows) VALUES
(1800,3,'residents_may.csv','failed',10,9,1);

INSERT INTO import_job_errors (id,import_job_id,row_number,field_name,error_message) VALUES
(1900,1800,8,'email','Invalid email format');

INSERT INTO exports (id,requested_by_user_id,export_type,filters,status,file_url) VALUES
(2000,3,'invoice_report','{"month":"2026-05"}','completed','https://example.com/exports/invoice_report_may.csv');
