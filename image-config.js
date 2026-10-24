// Put your photos in the images folder, then change the filenames below.
// Keep the quotes. JPG, PNG, WebP and SVG all work. No server is needed.
window.portfolioImages = {
  // Project menu welcome strip. Sizes/offsets in pixels; durations in seconds (higher = slower).
  welcomeStrip: {
    text: 'welcome to my portfolio, pick a project to proceed. or just scroll.',
    fontSize: 19,
    topOffset: 82,
    loopDuration: 32,
    entranceDuration: 0.7,
    entranceDelay: 0.1
  },
  projectMenuAnimation: {
    // Project baseline distance from the bottom of its panel, in percent.
    bottomOffset: 10,
    // Scroll distance in screen heights for the full entrance. Higher = slower reveal.
    scrollRevealDistance: 0.65,
    lineDuration: 3,
    cardDuration: 1.7,
    firstCardDelay: 0.15,
    cardStagger: 0.5,
    buttonDuration: 1.4,
    buttonDelay: 2
  },
  // Opening name size as a percentage of screen width. Previously 4.5; smaller numbers = smaller text.
  nameFontSize: 4.2,
  // PDFs open in a new browser tab; each card also has a separate download link.
  downloads: { portfolio: 'images/OzgunEgeBilgic_portfolio.pdf', cv: 'images/OzgunEgeBilgic-CV2026 21.10.pdf' },
  // Clickable topics in the Meet the designer section. Edit the text freely.
  designerTopics: [
    { label: 'Interior design', title: 'Spaces to experience.', text: 'I enjoy exploring how different spaces impact the experience and integrating these experiences back into design. I like creating stories within the interior and shaping user experience.' },
    { label: 'Game design', title: 'Another kind of space.', text: 'Alongside my academic projects, I have gained experience in both interior and exterior design through my work on game projects. My practice moves between physical and digital environments.' },
    { label: 'Cinema', title: 'Space, seen through a frame.', text: 'Cinema offers another way to think about space: through framing, light, movement, and atmosphere. I am interested in how these elements shape a story and how a place feels.' }
  ],
  // Vertical image speed: 1 = current, 0.5 = half speed, 2 = double, 0 = paused.
  stripScrollSpeed: 0.7,
  // Opening rolling images: true = black and white, false = original colors.
  stripBlackAndWhite: true,
  // Strength when enabled: 0 = full color, 0.5 = half, 1 = fully black and white.
  stripBlackAndWhiteStrength: 0.4,
  // One array per vertical project strip, left to right. Edit images inside each group.
  strips: [
    // Project 1 — 4 images
    [
      'images/vertical1.webp',
      'images/vertical2.webp',
      'images/vertical3.webp',
      'images/vertical4.webp'
    ],
    // Project 2 — 4 images
    [
      'images/vertical5.webp',
      'images/vertical6.webp',
      'images/vertical7.webp',
      'images/vertical8.webp'
    ],
    // Project 3 — 3 images
    [
      'images/vertical10.webp',
      'images/vertical12.webp',
      'images/vertical11.webp'
    ],
    // Project 4 — 3 images
    [
      'images/vertical9.webp',
      'images/vertical13.webp',
      'images/vertical14.webp' // Replace with your twelfth image.
    ]
  ],
  // Maximum feather width in pixels. The soft band grows as you scroll. 0 = sharp edge.
  filmRevealFeather: 340,
  film: 'images/books_1.gif', // Still image until you have a video.
  portrait: 'images/portrait.webp',
  // Four projects, in page order. Each gallery uses the matching strips group above.
  // image = timeline hover preview; introImage = large project-opening image.
  // map.image = map image. All of these can be changed independently.
  // Optional: add gallery: ['images/detail.webp', ...] to use separate project images.
  projects: [
    {
      title: 'The stage has collapsed into us!',
      indexTitle: 'the stage\nhas\ncollapsed\ninto us!',
      image: 'images/puppet.webp',
      introImage: 'images/puppet.webp',
      titleStyle: 'collapse',
      // Rolling text between the opening image and title. Set enabled to false to hide.
      verticalText: { enabled: true, text: 'You are being watched.', duration: 56 },
      course: 'INT201',
      instructor: 'Ceren Çelik',
      description: 'My first project explores the concept of a theatre and redefines it by dissolving the boundary between performer and audience, turning everyone into performers for the space. Rather than designing a fixed stage, the project choreographs moments of exposure, retreat, and interaction through architecture itself.',
      // Two editable images in the extra divided sheet before the map.
      beforeMapImages: ['images/consumer.webp', 'images/fall.webp'],
      // When supplied, show the first collage beside these text blocks.
      beforeMapText: [
        "Today's society increasingly resembles a theatre where visibility, consumption, and surveillance shape everyday behavior. The boundary between spectator and performer gradually dissolves as everyday life becomes increasingly exposed. This project translates these conditions into architecture, revealing the theatre that already exists around us in everyday life.",
        "Control rarely announces itself. It emerges through repetition, expectation, and visibility, slowly becoming indistinguishable from everyday life. What begins as observation evolves into self-surveillance, where the performance of social roles no longer feels imposed, but willingly embraced as part of who we are and have become."
      ],
      // Small text below each image, left then right. Leave empty to keep the space blank.
      beforeMapCaptions: ['', ''],
      // Each mapping section is 3509 × 1865 pixels.
      // Three sections stay visible edge to edge; interval is milliseconds between instant cuts.
      mapping: {
        enabled: true,
        labelFontSize: 16, // Tracking-bar text, in pixels.
        interval: 1400,
        images: ['images/mapping1.webp', 'images/mapping2.webp', 'images/mapping3.webp', 'images/mapping4.webp'],
        // One tracking-bar caption per image, in the same order.
        labels: [
          'GRAFFITI - ACTION LOAN / TRAM - SPACE DIVIDE',
          'TRAM - SPACE DIVIDE / POLICE - MATERIAL/ IMMATERIAL LOAN',
          'CINEMA - CYCLE DIVIDE / HIGH SCHOOL - ACTION SWAP',
          'CATHOLIC CHURCH - IMMATERIAL SWAP'
        ]
      },
      // New sheet after the mapping. Empty image paths leave blank placeholders.
      spatialStudy: {
        enabled: true,
        planImage: 'images/diagram2.jpg',
        planWidth: 82, // Percentage of the sheet width.
        planCrop: { sourceWidth: 4225, sourceHeight: 3717, top: 1030, height: 1610 }, // Display crop; original image stays intact.
        connectorGap: 16, // Gap in the diagram's 1000 × 800 coordinate space.
        detailImages: ['images/d1.jpg', 'images/d2.jpg', 'images/d3.jpg', 'images/d4.jpg', 'images/d5.jpg'],
        heightScale: 1.2, // Relative to the other drawing boxes.
        lineColor: '#761d1c',
        hoverDuration: 1.8, // Seconds per dotted-line cycle; larger is slower.
        description: 'The project questions how surveillance becomes internalized and how individuals are gradually pushed onto a stage without consent. Through overlapping sightlines, translucent surfaces, and exposed circulation, users remain constantly aware of one another. The boundary between observer and performer dissolves, turning everyday occupation into a shared act of visibility. The space becomes both a public stage and a critical device, revealing how privacy is quietly eroded through architecture.'
      },
      // Replace each window image with your own cutout. Transparent PNG/WebP works.
      diagram: {
        enabled: true,
        background: 'images/spatial-diagram.svg',
        windows: [
          { image: 'images/diag1.webp', label: 'Watching' },
          { image: 'images/diag2.webp', label: 'Enclosure' },
          { image: 'images/diag3.webp', label: 'Exposure' },
          { image: 'images/diag4.webp', label: 'Overhead' },
          { image: 'images/diag5.webp', label: 'Entry' },
          { image: 'images/diag6.webp', label: 'Performance' },
          { image: 'images/white.svg', label: 'Retreat' }
        ]
      },
      // Replace with your map, with the building centered. zoom: 1 = no zoom.
      map: {
        image: 'images/mapsalt.svg',
        zoom: 120,
        statement: 'How do we understand the existing stage?'
      }
    },
    { title: 'We were never invited.', indexTitle: 'we were\nnever\ninvited.', image: 'images/vertical5.webp', introImage: 'images/vertical5.webp' },
    { title: '2YAKA', image: 'images/vertical10.webp', introImage: 'images/vertical10.webp' },
    { title: 'Baho la Fresca', indexTitle: 'Baho\nla Fresca', image: 'images/vertical9.webp', introImage: 'images/vertical9.webp' }
  ]
};

