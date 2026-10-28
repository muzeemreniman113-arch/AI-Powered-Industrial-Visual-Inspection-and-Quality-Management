# AI-Powered Industrial Visual Inspection Datasets: Master Benchmark Directory

The deployment of computer vision and deep learning in factory quality control requires dataset selection tailored to optical conditions, material properties, and defect geometries. Automated Optical Inspection (AOI) systems operate under strict operational constraints where missed defects (False Negatives) carry severe commercial costs, while false alarms (False Positives) degrade manufacturing throughput.

This master directory consolidates over thirty public industrial visual inspection datasets and benchmark suites compiled from literature, repository catalogs, and research repositories. It establishes a standardized framework for selecting visual defect datasets across key manufacturing sectors—including printed circuit boards (PCBs), metal processing, energy infrastructure, 3D sensor inspection, and general manufactured goods.

---

## 1. Master Dataset Comparison Matrix

The table below synthesizes the primary visual inspection and anomaly detection datasets across modalities, domains, and annotation granularities.

| Dataset Name | Primary Industrial Domain | Modality & Resolution | Total Samples / Image Split | Supervision Level | Annotation Type | Defect Types & Target Anomalies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MVTec AD** | General Manufacturing / Objects & Textures | 2D Color RGB (700x700 to 1024x1024) | 5,354 images (3,629 train normal / 1,725 test) | Unsupervised (No Supervision) | Pixel-wise masks | Scratches, dents, contamination, structural defects across 15 classes |
| **VisA** | Electronics, Consumer Goods & Food | 2D Color RGB (High-Res) | 10,821 images (9,621 normal / 1,200 anomalous) | Unsupervised | Pixel-wise & image-level | Scratches, dents, cracks, missing components, misplacement (12 subsets) |
| **Real-IAD** | Multi-View Manufacturing Objects | 2D Color RGB (Multi-View) | 151,050 images (99,721 normal / 51,329 anomaly) | Unsupervised | Pixel-wise masks | Multi-angle surface anomalies, physical deformation across 30 object types |
| **DeepPCB** | Printed Circuit Board (PCB) Manufacturing | 2D Binary Image Pairs (640x640 sub-images) | 1,500 aligned pairs (1,000 train / 500 test) | Strong Supervision | Bounding box coordinates | Open circuits, short circuits, mousebite, spur, pinholes, spurious copper |
| **NEU Surface Defect** | Hot-Rolled Steel Sheet Manufacturing | 2D Grayscale (200x200) | 1,800 images (6 categories x 300) | Weak / Strong | Bounding box coordinates | Crazing, inclusion, patches, pitted surfaces, rolled-in scales, scratches |
| **Severstal Steel** | Heavy Metal Processing & Steel Production | 2D Grayscale / Color (512x256) | 12,572 images (26,664 annotated regions) | Strong Supervision | Pixel-wise run-length masks | 4 distinct steel surface defect categories (cracks, inclusions, pitting) |
| **DAGM 2007** | Artificially Generated Texture & Metals | 2D Grayscale (512x512, 8-bit) | 16,100 images (10 texture classes) | Weak / Strong | Elliptical bounding boxes | Background-subtle scratches, specks, texture irregularities |
| **KolektorSDD** | Electrical Commutators (Plastic Embeddings) | 2D Grayscale (500x1240 to 1270) | 399 images (52 defective / 347 normal) | Strong Supervision | Pixel-wise masks | Surface cracks, fracture lines in commutator embedding |
| **KolektorSDD2** | Industrial Electrical Production Items | 2D Color RGB (~230x630) | 3,335 images (356 defective / 2,979 normal) | Strong Supervision | Pixel-wise masks | Scratches, dark spots, surface imperfections, color irregularities |
| **MVTec 3D-AD** | 3D Physical Sensor Inspection | 3D Point Cloud + 2D RGB Scan | 4,000+ 3D sensor scans (10 categories) | Unsupervised | Pixel-wise 3D ground truth | Surface dents, shape distortions, material voids, structural defects |
| **MVTec LOCO AD** | Logical & Structural Assembly Lines | 2D Color RGB (High-Res) | 3,644 images (5 categories) | Unsupervised | Pixel-wise logical masks | Missing components, incorrect order, structural deformations |
| **BTAD** | Industrial Product Textures | 2D Color RGB (Varied) | 2,540 images (3 industrial products) | Unsupervised | Pixel-wise masks | Surface abrasion, body defects, texture anomalies |
| **MPDD** | Fabricated Painted Metal Parts | 2D Color RGB (Diverse orientations) | 1,346 images (888 train normal / 458 test) | Unsupervised | Pixel-wise masks | Paint scratches, dents, coating flaws under non-homogeneous lighting |
| **Magnetic Tile (MTD)** | Ceramic & Ferromagnetic Components | 2D ROI Cropped Images | 1,344 ROI surface images | Strong Supervision | Pixel-level segmentation | Blowholes, cracks, frays, breaks, grinding unevenness |
| **PKU-Market-Phone** | Consumer Electronics Cover Glass | 2D Color RGB (1920x1080) | 1,200 images (400 per defect class) | Strong Supervision | PASCAL VOC Bounding Boxes | Surface oil, scratches, stains on phone casings |
| **PKU-GoodsAD** | Consumer Packaged Goods | 2D High-Res (3000x3000) | 6,124 images (3,136 train / 2,988 test) | Unsupervised | Pixel-wise masks | Surface damage, box deformation, opened packages (484 product types) |
| **InsPLAD (Fault)** | Power Line Transmission Towers | 2D UAV Aerial RGB Images | 11,662 images (402 defective objects) | Weak Supervision | Image-level labels | Insulator damage, component corrosion, structural faults |
| **VISION V1 / V2** | Multi-Industry Manufacturing Inspection | 2D Color RGB (Diverse) | V1: 18,422 imgs / V2: 13,804 annotated | Mixed / Strong | Bounding boxes & masks | Comprehensive multi-industry assembly flaws (14 sub-datasets) |
| **MAD (Sim / Real)** | Multi-Pose Complex Objects (LEGO) | 2D Multi-Pose RGB | 4,000+ train views / 7,000+ test images | Unsupervised | Pixel-wise ground truth | Pose-independent surface damage, part mismatch, color anomalies |
| **Defect Spectrum** | Multi-Layered Industrial Defects | 2D Multimodal RGB & Semantics | Large-Scale Multi-Layer Annotated | Supervised / Multimodal | Fine-grained semantic masks | Multi-class co-occurring defects per image |
| **elpv-dataset** | Solar Cell Photovoltaic Modules | 2D Electroluminescence (8-bit) | 2,624 module images | Weak Supervision | Image-level probability | Micro-cracks, finger interruptions, degradation in solar wafers |
| **Real3D-AD** | High-Precision 3D Object Prototyping | 3D Point Cloud + 2D RGB | 1,254 3D samples (12 categories) | Unsupervised | 3D Point-level masks | Physical volumetric defects, surface concavity, shape distortions |
| **Anomaly-ShapeNet** | Synthetic 3D CAD Shapes | 3D Mesh / Point Cloud | 1,600 samples (40 CAD categories) | Unsupervised (4 train/cat) | 3D Mesh ground truth | Bulges, concavities, cracks, holes, broken geometry |
| **RSDDs** | Railway Track Infrastructure | 2D Grayscale Strip Images | Dual Rail Datasets (Express & Heavy Freight)| Strong Supervision | Pixel-wise masks | Rail head squats, corrugation, shellings, cracks |
| **Insulator DataSet** | High-Voltage Utility Power Lines | 2D Aerial & Field RGB | 2,000+ field inspection images | Strong Supervision | Bounding boxes | Broken insulator discs, flashover marks, cap corrosion |
| **CrackForest** | Road & Pavement Civil Infrastructure | 2D Color RGB (320x240) | 118 pavement images | Strong Supervision | Pixel-level ground truth | Structural pavement cracks, asphalt weathering |

---

## 2. General 2D Industrial Anomaly Detection Benchmarks

Unsupervised anomaly detection datasets mirror production environments where defect-free training data is abundant, but defective samples are rare and unpredictable.

### MVTec Anomaly Detection (MVTec AD)
Published by MVTec Software GmbH in 2019, MVTec AD stands as the definitive benchmark for 2D visual anomaly localization.
*   **Structure**: 5,354 color images across 15 categories, categorized into 5 rigid textures (carpet, grid, leather, tile, wood) and 10 discrete objects (bottle, cable, capsule, hazelnut, metal nut, pill, screw, toothbrush, transistor, zipper).
*   **Split**: 3,629 defect-free training images and 1,725 testing images containing both normal samples and defect variations.
*   **Annotations**: Pixel-precise binary segmentation masks for every anomalous test region.

### Visual Anomaly (VisA)
Introduced by Amazon Science, VisA addresses complex structural topologies and multi-instance view inspection.
*   **Structure**: 10,821 high-resolution images (9,621 normal, 1,200 anomalous) divided across 12 subsets.
*   **Categories**: 4 printed circuit board subsets (complex multi-component structures), 4 multi-instance view subsets (capsules, candles, macaroni variants with position/pose variations), and 4 single-object aligned subsets (cashews, chewing gum, fryum, pipe fryum).
*   **Defect Spectrum**: Surface anomalies (scratches, color spots, cracks) and high-level structural anomalies (missing chips, misaligned components).

### Real-IAD
Real-IAD provides a large-scale multi-view industrial anomaly benchmark capturing real-world manufacturing conditions.
*   **Structure**: 151,050 high-resolution images across 30 object categories (99,721 normal, 51,329 anomaly images).
*   **Key Advantage**: Captures objects from multi-angle camera arrays, evaluating pose-invariant anomaly localization across high defect area ratios.

---

## 3. Electronics, PCB & Component Inspection Datasets

Electronics manufacturing requires millimeter-scale optical resolution to spot structural defects in conductive traces, solder joints, and component placements.

### DeepPCB
DeepPCB provides a dedicated dataset for automated printed circuit board (PCB) quality assurance.
*   **Acquisition**: Captured using a linear scan CCD camera at a optical resolution of approximately 48 pixels per millimeter.
*   **Structure**: 1,500 aligned sub-image pairs (640x640 pixels cropped from 16,000x16,000 master scans) consisting of a pristine reference template image and a tested board image.
*   **Defect Categories**: Annotates six critical structural flaws:
    1. *Open circuit* (broken trace)
    2. *Short circuit* (unwanted connection)
    3. *Mousebite* (edge copper erosion)
    4. *Spur* (trace protrusion)
    5. *Pinhole* (void in solder pad)
    6. *Spurious copper* (isolated copper island)
*   **Split**: 1,000 image pairs for training and 500 for evaluation.

### KolektorSDD & KolektorSDD2
Developed in collaboration with Kolektor Group d.o.o. for electrical component quality control.
*   **KolektorSDD**: Contains 399 grayscale images (500x1240-1270 pixels) of plastic embeddings in electrical commutators, featuring 52 defective samples with pixel-exact crack segmentation masks.
*   **KolektorSDD2**: Expands to 3,335 color photographs (~230x630 pixels) featuring 356 defective items (246 train / 110 test) and 2,979 normal samples across diverse surface flaw types (scratches, spots, color variations).

---

## 4. Metallurgy, Steel & Heavy Material Defect Datasets

Metal processing datasets operate under noisy background textures, reflective oil films, and high industrial line speeds.

### NEU Surface Defect Database
Published by Northeastern University, NEU is the standard benchmark for hot-rolled steel strip inspection.
*   **Structure**: 1,800 grayscale images (200x200 pixels) divided evenly across six steel defect classes (300 images per class):
    *   *Crazing* (fine network cracks)
    *   *Inclusion* (non-metallic particles)
    *   *Patches* (surface press-ins)
    *   *Pitted Surface* (periodic indentations)
    *   *Rolled-in Scale* (iron oxide scale pressed into metal)
    *   *Scratches* (longitudinal mechanical abrasion)
*   **Annotations**: Bounding box localization for classification benchmarking.

### Severstal Steel Defect Dataset
Released by PAO Severstal via Kaggle, this dataset represents one of the largest production steel inspection collections.
*   **Structure**: 12,572 high-resolution images (512x256 pixels) depicting rolled steel sheets under factory illumination.
*   **Annotations**: Run-length encoded (RLE) pixel-wise segmentation masks covering 4 distinct surface defect classes.

### Magnetic Tile Defect Dataset (MTD)
Focuses on permanent magnetic tile components used in electric motors.
*   **Structure**: 1,344 region-of-interest (ROI) surface images categorized into 6 defect datasets: blowholes, cracks, frays, breaks, grinding unevenness, and defect-free tile surfaces. Includes pixel-level ground truth masks.

---

## 5. Infrastructure, Energy & 3D Sensor Datasets

### Defective Solar Cells (elpv-dataset)
Contains 2,624 high-resolution 8-bit grayscale electroluminescence (EL) images of monocrystalline and polycrystalline solar cells.
*   **Defect Classes**: Captures micro-cracks, finger interruptions, and cell degradation, annotated with defect probability scores (0.0 to 1.0).

### MVTec 3D-AD
Extends industrial visual inspection into volumetric point clouds using an industrial 3D sensor.
*   **Structure**: Over 4,000 high-resolution scans across 10 object categories combining calibrated 2D RGB images with dense 3D point cloud coordinates ($X, Y, Z$).
*   **Split**: 2,656 defect-free training scans and 1,137 test scans featuring physical anomalies (dents, material voids, surface swelling) with pixel-exact 3D ground truth masks.

---

## 6. Benchmarking Metrics & Supervision Framework

Selecting an appropriate benchmark requires matching algorithm supervision levels with factory annotations:

1. **Unsupervised Anomaly Detection (No Supervision)**: Trained strictly on defect-free samples ($N$). Used when defect types are unknown prior to deployment (e.g., MVTec AD, VisA, Real-IAD).
2. **Weak Supervision**: Trained on image-level binary flags (Defective / Non-Defective) without bounding boxes or masks (e.g., elpv-dataset, InsPLAD-fault).
3. **Strong Supervision**: Trained with exact bounding boxes or pixel-wise segmentation masks (e.g., DeepPCB, Severstal, KolektorSDD2).

### Production Evaluation Metrics
In high-speed production lines, evaluation metrics must reflect economic trade-offs:
*   **False Negative Rate (FNR)**: $\text{FNR} = \frac{\text{FN}}{\text{TP} + \text{FN}}$. In manufacturing, an un-detected defect shipped to a client incurs massive recall costs. Algorithms prioritize minimizing FNR (maximizing Recall).
*   **False Positive Rate (FPR)**: $\text{FPR} = \frac{\text{FP}}{\text{FP} + \text{TN}}$. High false alarms stop production lines unnecessarily.
*   **Segmentation Metrics**: Evaluated via **Intersection over Union (IoU)** ($\frac{|G \cap P|}{|G \cup P|}$) and **Dice Coefficient** ($\frac{2|G \cap P|}{|G| + |P|}$), as well as pixel-wise AUROC.

---

## 7. Dataset Access & Licensing Terms

| Dataset Name | Repository / Access Host | License Terms | Commercial Usage Permitted? |
| :--- | :--- | :--- | :--- |
| **MVTec AD** | [MVTec AD Official Page](https://www.mvtec.com/research-teaching/datasets/mvtec-ad) | Creative Commons CC BY-NC-SA 4.0 | Non-Commercial Only |
| **MVTec 3D-AD** | [MVTec 3D-AD Official Page](https://www.mvtec.com/research-teaching/datasets/mvtec-3d-ad) | Creative Commons CC BY-NC-SA 4.0 | Non-Commercial Only |
| **DeepPCB** | [GitHub Repository (tangsanli5201)](https://github.com/tangsanli5201/DeepPCB) | MIT License / Academic Research | Non-Commercial Research |
| **Severstal Steel** | [Kaggle Competition Repository](https://www.kaggle.com/c/severstal-steel-defect-detection) | Kaggle Competition Terms | Research & Evaluation |
| **NEU Surface Defect**| [Northeastern University Host](http://faculty.neu.edu.cn/songkc/en/zdylm/263265) | Academic License | Non-Commercial Only |
| **VisA Dataset** | [GitHub (amazon-science/spot-diff)](https://github.com/amazon-science/spot-diff) | Custom Research License | Academic Research |
| **Real-IAD** | [Real-IAD GitHub Project](https://realiad4ad.github.io/Real-IAD/) | Research License | Academic Research |
| **KolektorSDD / SDD2**| [ViCoS Lab Downloads](https://www.vicos.si/resources/kolektorsdd/) | Academic Non-Commercial | Non-Commercial Only |
| **elpv-dataset** | [GitHub (zae-bayern/elpv-dataset)](https://github.com/zae-bayern/elpv-dataset) | MIT License | Research & Open Source |
| **Magnetic Tile (MTD)**| [GitHub (abin24/Magnetic-tile-defect-datasets)](https://github.com/abin24/Magnetic-tile-defect-datasets) | Open Source Research | Non-Commercial Only |
