# 🌌 ExoHunt AI - NASA Kepler Exoplanet Discovery Engine
**Ứng dụng Trí tuệ Nhân tạo Khám phá Ngoại hành tinh từ Dữ liệu Kính viễn vọng Không gian NASA Kepler**

---

## 📌 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Dự án **ExoHunt AI** là một hệ thống nghiên cứu khoa học dữ liệu và học máy chuyên sâu, áp dụng các kiến trúc Trí tuệ Nhân tạo hiện đại để giải mã tín hiệu suy giảm ánh sáng (lightcurves) từ **9,564 mục tiêu quan trắc (Kepler Objects of Interest - KOI)** của Kính viễn vọng Không gian NASA Kepler.

Mục tiêu cốt lõi của nghiên cứu là phân loại chính xác các tín hiệu thu nhận được thành 3 nhóm đối tượng thiên văn:
1. 🟢 **CONFIRMED (Hành tinh xác nhận):** Các ngoại hành tinh thực thụ quay quanh sao chủ, có tín hiệu che khuất ánh sáng hình chữ U đáy phẳng đặc trưng.
2. 🔵 **CANDIDATE (Ứng viên hành tinh):** Các tín hiệu tiềm năng cần quan trắc thêm để xác minh.
3. 🔴 **FALSE POSITIVE (Tín hiệu giả mạo):** Các hiện tượng thiên văn bị nhầm lẫn với ngoại hành tinh (chủ yếu là hệ **sao đôi che khuất chéo - Eclipsing Binaries** tạo ra đáy chữ V sâu hoặc các hiện tượng nhiễu từ trường sao chủ).

---

## 🤖 2. SO SÁNH 3 KIẾN TRÚC MÔ HÌNH AI (MODEL ARCHITECTURES)

Trong nghiên cứu này, chúng tôi đã phát triển, huấn luyện trên GPU Kaggle và kiểm định chéo (5-Fold Stratified Cross-Validation) 3 kiến trúc mô hình với các vai trò khoa học khác nhau:

| Kiến trúc Mô hình | Kỹ thuật cốt lõi | Độ chính xác (Test Acc) | ROC-AUC | Vai trò trong Báo cáo Nghiên cứu |
| :--- | :--- | :---: | :---: | :--- |
| 🌲 **Random Forest Baseline** | Ensemble Decision Trees (100 estimators), SMOTE Balancing | **98.24%** | **0.999** | **Mô hình Cơ sở (Ceiling Baseline):** Sử dụng toàn bộ 43 đặc trưng, bao gồm cả 4 cờ thẩm định của con người từ NASA. |
| ⚡ **XGBoost Pure Physics** | Gradient Boosting, Dropout-like Regularization | **88.52%** | **0.968** | **Mô hình Vật lý Thuần túy (Core Breakthrough):** Loại bỏ hoàn toàn 4 cờ gian lận, buộc AI tự học định luật che khuất quang học và định luật Kepler. |
| 🧠 **PyTorch 1D-CNN** | Deep Learning: 2x Conv1D + BatchNorm + MaxPool1D + Dropout | **92.10%** | **0.975** | **Mạng Học sâu Không gian:** Tự động trích xuất đặc trưng hình thái tín hiệu không gian 1 chiều mà không cần feature engineering thủ công. |

---

## 🔬 3. ĐỘT PHÁ KHOA HỌC: PHÁT HIỆN RÒ RỈ DỮ LIỆU (DATA LEAKAGE DEEP-DIVE)

Một trong những phát hiện quan trọng nhất của nghiên cứu này nằm ở **Phần 6c & Phần 7 (SHAP Analysis)** trong Notebook:

### 🚨 Vấn đề "Ảo tưởng 98.24%" (Why Baseline achieved 98%?)
Khi huấn luyện mô hình Baseline ban đầu, độ chính xác đạt ngưỡng cực cao 98.24%. Tuy nhiên, khi sử dụng công cụ giải thích AI **SHAP (SHapley Additive exPlanations)** để phân tích đóng góp của từng biến, chúng tôi phát hiện 4 đặc trưng đứng đầu bảng đều là các cờ thẩm định thủ công do các nhà thiên văn học NASA gán sau khi đã phân tích:
* `koi_fpflag_nt` (Not Transit-Like Flag)
* `koi_fpflag_ss` (Stellar Eclipse Flag - Sao đôi che khuất)
* `koi_fpflag_co` (Centroid Offset Flag)
* `koi_fpflag_ec` (Ephemeris Match Flag)

👉 **Kết luận:** Mô hình Baseline bị mắc lỗi **Rò rỉ dữ liệu (Data Leakage)** nghiêm trọng — AI không hề "hiểu" vật lý thiên văn mà chỉ đang "học vẹt" kết quả gán nhãn của con người! Một mô hình như vậy sẽ **hoàn toàn vô dụng** khi áp dụng vào các sứ mệnh viễn vọng mới (như TESS hay PLATO) khi dữ liệu thu về là dữ liệu thô chưa có ai gán cờ!

### 💡 Giải pháp & Sự thật về Định luật Quá cảnh (The Pure Physics Model)
Để xây dựng một AI thực sự có năng lực tự khám phá ngoại hành tinh mới, chúng tôi đã **kiên quyết loại bỏ hoàn toàn 4 cờ gian lận trên** và huấn luyện lại mô hình **XGBoost Pure Physics**.
* **Độ chính xác:** Giảm xuống **88.52%** — đây là con số trung thực tuyệt đối phản ánh đúng độ khó của vũ trụ!
* **Biểu đồ SHAP Vật lý mới:** Chứng minh AI đã tự động đưa các thông số quang học cốt lõi lên dẫn đầu:
  1. `koi_srad` (Bán kính sao chủ - Quyết định tỷ lệ che khuất)
  2. `koi_depth` (Độ sâu quá cảnh - Trực tiếp phản ánh kích thước hành tinh)
  3. `koi_period` (Chu kỳ quỹ đạo - Tuân theo định luật Kepler 3)

---

## 🚀 4. HƯỚNG DẪN CÀI ĐẶT THƯ VIỆN & CHẠY DỰ ÁN (HOW TO RUN PROJECT)

Dự án được hỗ trợ chạy linh hoạt theo 2 phương thức: **Chạy Máy chủ Backend Python (FastAPI + PyTorch Engine)** hoặc **Chạy Trực tiếp trên Trình duyệt (Offline Client-side Mode)**.

### 🛠️ Bước 1: Cài đặt Thư viện Python (Prerequisites & Requirements)
Để máy chủ Python có thể tải các mô hình `.pkl`, `.json` và `.pth` từ thư mục `./weight/`, bạn cần cài đặt các thư viện được liệt kê trong file **`requirements.txt`** (hoặc `requement.txt`):

1. Mở Terminal (Command Prompt / PowerShell / VS Code Terminal) tại thư mục dự án `exohunt-ai-nasa`:
   ```bash
   pip install -r requirements.txt
   ```
   *(Hoặc nếu sử dụng file `requement.txt`: `pip install -r requement.txt`)*

2. **⚠️ LƯU Ý ĐẶC BIỆT CHO WINDOWS (Khắc phục lỗi PyTorch WinError 127):**
   Nếu khi chạy lệnh trên Windows, bạn gặp lỗi liên quan đến thiếu CUDA DLL (ví dụ: `[WinError 127] The specified procedure could not be found... c10_cuda.dll`), nguyên nhân là do gói PyTorch mặc định tìm kiếm card đồ họa NVIDIA CUDA không tương thích.
   👉 **Cách khắc phục triệt để:** Gỡ bản PyTorch hiện tại và cài đặt phiên bản **PyTorch CPU-Only**:
   ```bash
   pip uninstall torch torchvision torchaudio -y
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   ```

---

### ⚡ Bước 2: Khởi động Máy chủ & Trải nghiệm Ứng dụng

#### Phương án A: Chạy Máy chủ Backend Python FastAPI (Khuyên dùng)
Khi chạy qua máy chủ Python, hệ thống sẽ trực tiếp gọi suy luận (inference) từ các trọng số mô hình thật trong thư mục `./weight/`:
1. Chạy lệnh khởi động máy chủ:
   ```bash
   python app.py
   ```
2. Mở trình duyệt web (Google Chrome, Microsoft Edge, Firefox, Safari) và truy cập địa chỉ hiển thị trên terminal:
   👉 **`http://127.0.0.1:8000`**
3. Giao diện **ExoHunt AI Observatory** sẽ tải lên. Mọi thao tác kéo thanh trượt trên tab *A/B Testing* sẽ gửi yêu cầu xử lý thời gian thực tới máy chủ Python!

#### Phương án B: Chạy Trực tiếp trên Trình duyệt (Chế độ Offline Nhanh nhất)
Trong trường hợp bạn không muốn cài đặt Python hoặc đang mở trên máy tính không có môi trường lập trình, ứng dụng đã được tích hợp sẵn **Bộ phỏng đoán AI phía máy khách (Client-side Astrophysical Simulator)**:
1. Mở thư mục dự án `exohunt-ai-nasa`.
2. Nhấp đúp chuột trực tiếp vào file **`index.html`** (hoặc chuột phải chọn *Open with -> Google Chrome / Microsoft Edge*).
3. Toàn bộ các tính năng: giả lập A/B Testing, vẽ đường cong ánh sáng Lightcurve thời gian thực và xem ảnh độ phân giải cao 600 DPI đều hoạt động mượt mà 100%!

---

## 📁 5. CẤU TRÚC THƯ MỤC DỰ ÁN (DIRECTORY STRUCTURE)

```text
d:/Slide_THPT/DangDucThanh_AI/exohunt-ai-nasa/
│
├── 📄 index.html                        # Giao diện HTML5 Đài quan trắc (5 Tabs chức năng)
├── 🎨 style.css                         # Hệ thống giao diện Deep Space Dark Mode, Glassmorphism
├── ⚡ script.js                         # Bộ xử lý tương tác, Giả lập A/B Testing & Canvas Lightcurve
├── 🐍 app.py                            # Máy chủ FastAPI & PyTorch Inference Engine
├── 📦 requirements.txt                  # Danh sách thư viện chuẩn (FastAPI, PyTorch, XGBoost, SHAP...)
├── 📦 requement.txt                     # File danh sách thư viện (tên phụ trợ)
├── 📖 README.md                         # Tài liệu báo cáo & hướng dẫn sử dụng (File này)
│
├── 📓 exohunt-ai-nasa-dangducthanh.ipynb # Notebook nghiên cứu gốc (1,748 dòng code EDA, ML, DL, SHAP)
│
├── 📂 exoplanet_research_plots/         # Thư viện 5 biểu đồ nghiên cứu chất lượng cao (600 DPI)
│   ├── eda_exoplanet_analysis.png       # Biểu đồ Khám phá dữ liệu & tương quan vật lý
│   ├── roc_auc_comparison.png           # Đường cong ROC-AUC so sánh 3 mô hình
│   ├── shap_feature_importance.png      # Biểu đồ SHAP Baseline (Phát hiện Data Leakage)
│   ├── shap_pure_physics.png            # Biểu đồ SHAP Vật lý thuần túy (Đột phá nghiên cứu)
│   └── confusion_matrix_errors.png      # Ma trận nhầm lẫn & Phân tích lỗi Eclipsing Binaries
│
└── 📂 weight/                           # Thư mục chứa trọng số các mô hình đã đóng gói
    ├── random_forest_baseline.pkl       # Trọng số Random Forest Baseline (17.1 MB)
    ├── xgboost_physics_model.json       # Trọng số XGBoost Pure Physics (4.1 MB)
    ├── 1d_cnn_weights.pth               # Trọng số PyTorch 1D-CNN StateDict (96.6 KB)
    ├── scaler_main.pkl                  # Bộ chuẩn hóa Z-Score StandardScaler (2.4 KB)
    └── label_encoder.pkl                # Bộ mã hóa nhãn nhị phân/đa lớp (514 B)
```

---
*Tác giả nghiên cứu & phát triển ứng dụng Demo: Đặng Đức Thành - ExoHunt AI NASA Exoplanet Research Project.*
