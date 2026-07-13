export const projects = [
  {
    title: 'Cardiopulmonary Sound Separation System',
    context: 'Final Year Project',
    status: 'Research prototype in progress',
    summary:
      'A local web application for separating mixed heart and lung recordings with multiple signal-processing and machine-learning strategies.',
    contribution:
      'Built the application workflow, API and persistence layers, strategy integrations, and browser-facing preview and download flow.',
    functionality: [
      'Fixed-filter, NMF, VMD, and externally attributed NeoSSNet strategies',
      'WAV upload, preview, separated output downloads, and job history',
      'SQLite metadata plus dataset preparation, training, and evaluation tooling',
    ],
    tech: ['Python', 'FastAPI', 'PyTorch', 'SQLite', 'SQLAlchemy', 'JavaScript'],
    github:
      'https://github.com/ASHRAF-2004/Machine-Learning-Based-System-for-Cardiopulmonary-Sound-Separation',
    visual: 'audio',
    featured: true,
  },
  {
    title: 'Parking Lot Management System',
    context: 'Educational desktop application',
    status: 'Runnable',
    summary:
      'A multi-floor parking workflow covering entry, spot allocation, exit, payments, fines, and operational reports.',
    contribution:
      'Implemented the layered model, repository, service, and Swing interface around a persistent SQLite data store.',
    functionality: [
      'Multi-floor vehicle entry, exit, and spot allocation',
      'Fixed, hourly, and progressive fine configuration',
      'Payment handling and operational reporting',
    ],
    tech: ['Java 17', 'Swing', 'SQLite', 'Maven', 'Design Patterns'],
    github: 'https://github.com/ASHRAF-2004/parking-lot-management-system',
    visual: 'parking',
  },
  {
    title: 'Seminar Management System',
    context: 'Academic desktop application',
    status: 'Runnable',
    summary:
      'A role-based seminar workflow for students, evaluators, and coordinators, with scheduling and rubric-based evaluation.',
    contribution:
      'Built the Java Swing application structure, role workflows, service layer, and CSV-backed persistence.',
    functionality: [
      'Student enrollment and seminar scheduling',
      'Evaluator scoring, rubrics, and comments',
      'Coordinator workflows with layered application structure',
    ],
    tech: ['Java 17', 'Swing', 'CSV', 'Maven', 'Layered Architecture'],
    github: 'https://github.com/ASHRAF-2004/Seminar-Management-System',
    visual: 'seminar',
  },
  {
    title: 'FalconOCR',
    context: 'C++ systems project',
    status: 'Experimental prototype',
    summary:
      'A from-scratch OCR pipeline that explores image preprocessing, segmentation, normalization, and template classification.',
    contribution:
      'Implemented the C++ pipeline, native Win32 interface, cross-platform CLI, glyph-pack discovery, and smoke tests.',
    functionality: [
      'Image input, binarization, segmentation, and normalization stages',
      'Pluggable glyph packs and template-based classification',
      'Win32 GUI with a non-Windows command-line path',
    ],
    tech: ['C++17', 'CMake', 'Win32 API', 'Image Processing', 'GoogleTest'],
    github: 'https://github.com/ASHRAF-2004/FalconOCR',
    visual: 'ocr',
  },
]
