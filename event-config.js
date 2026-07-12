const placeholderProjectDescription = "This is a place holder one sentence project description.";

window.challengeConfig = {
  // Primary live data source. The gallery reloads this Google Sheet whenever the page is refreshed.
  projectDataUrl: "https://docs.google.com/spreadsheets/d/1o2BFaUQBgFapPPMOn08PBQrrISIDZhGhlYDQ0uUPr8Q/edit?usp=sharing",

  // Backup data source if the Google Sheet is unavailable or has no project rows.
  projectDataCsvUrl: "./projects.csv?v=google-sheet-gallery",
  defaultProjectImage: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",

  // Optional voting configuration.
  votingFormUrl: "#",
  votingFormProjectField: "",
  voteResultsUrl: "#",
  voteResultsCsvUrl: "",
  voteProjectColumn: "Project",

  fallbackProjects: Array.from({ length: 17 }, (_, index) => {
    const teamNumber = String(index + 1).padStart(2, "0");

    return {
      team: `Team ${teamNumber}`,
      title: `Project ${teamNumber} title placeholder`,
      url: "",
      image: "",
      pitch: placeholderProjectDescription
    };
  })
};
