class UniversitySearch {
  constructor() {
    this.searchData = []
    this.currentResults = []
    this.isSearching = false

    this.init()
  }

  init() {
    this.indexCurrentPage()
    this.bindSearchEvents()

    this.createSearchResultsContainer()
  }

  bindSearchEvents() {
    const desktopSearchInput = document.querySelector(".search-box input")
    const desktopSearchButton = document.querySelector(".search-box button")

    const mobileSearchInput = document.querySelector(".mobile-search input")
    const mobileSearchButton = document.querySelector(".mobile-search button")

    if (desktopSearchInput) {
      desktopSearchInput.addEventListener("input", (e) => {
        this.handleSearch(e.target.value)
      })

      desktopSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          this.handleSearch(e.target.value)
        }
      })
    }

    if (desktopSearchButton) {
      desktopSearchButton.addEventListener("click", (e) => {
        e.preventDefault()
        const query = desktopSearchInput.value
        this.handleSearch(query)
      })
    }

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("input", (e) => {
        this.handleSearch(e.target.value)
      })

      mobileSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          this.handleSearch(e.target.value)
        }
      })
    }

    if (mobileSearchButton) {
      mobileSearchButton.addEventListener("click", (e) => {
        e.preventDefault()
        const query = mobileSearchInput.value
        this.handleSearch(query)
      })
    }

    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".search-results-container") &&
        !e.target.closest(".search-box") &&
        !e.target.closest(".mobile-search")
      ) {
        this.hideSearchResults()
      }
    })
  }

  indexCurrentPage() {    const searchableSections = [
      { selector: ".hero-title", weight: 10, type: "title" },
      { selector: ".hero-subtitle", weight: 8, type: "subtitle" },
      { selector: ".section-title", weight: 9, type: "section-title" },
      { selector: ".feature-title", weight: 7, type: "feature-title" },
      { selector: ".feature-desc", weight: 5, type: "description" },
      { selector: ".about-subtitle", weight: 8, type: "subtitle" },
      { selector: ".about-desc", weight: 5, type: "description" },
      { selector: ".education-card-title", weight: 7, type: "program-title" },
      { selector: ".education-card-desc", weight: 5, type: "program-description" },
      { selector: ".applicant-subtitle", weight: 8, type: "subtitle" },
      { selector: ".step-title", weight: 6, type: "step-title" },
      { selector: ".step-desc", weight: 4, type: "step-description" },
      { selector: ".anau-card-title", weight: 7, type: "card-title" },
      { selector: ".anau-card-desc", weight: 5, type: "card-description" },
      { selector: ".news-title", weight: 7, type: "news-title" },
      { selector: ".news-desc", weight: 5, type: "news-description" },
      { selector: ".nav-link", weight: 6, type: "navigation" },
      { selector: "p", weight: 3, type: "paragraph" },
      { selector: "h1, h2, h3, h4, h5, h6", weight: 8, type: "heading" },
    ]

    this.searchData = []

    searchableSections.forEach((section) => {
      const elements = document.querySelectorAll(section.selector)
      elements.forEach((element, index) => {
        const text = element.textContent.trim()
        if (text && text.length > 2) {
          this.searchData.push({
            id: `${section.type}-${index}`,
            text: text,
            element: element,
            weight: section.weight,
            type: section.type,
            url: window.location.pathname,
            section: this.findParentSection(element),
          })
        }
      })
    })

    this.addPageSpecificData()
  }

  addPageSpecificData() {
    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((link, index) => {
      const href = link.getAttribute("href")
      const text = link.textContent.trim()
      if (text && href) {
        this.searchData.push({
          id: `nav-${index}`,
          text: text,
          element: link,
          weight: 6,
          type: "navigation",
          url: href,
          section: "Navigation",
        })
      }
    })

    const contactInfo = document.querySelectorAll(".contact-info a, .footer-contact-item")
    contactInfo.forEach((item, index) => {
      const text = item.textContent.trim()
      if (text) {
        this.searchData.push({
          id: `contact-${index}`,
          text: text,
          element: item,
          weight: 4,
          type: "contact",
          url: window.location.pathname,
          section: "Contact Information",
        })
      }
    })
  }

  findParentSection(element) {
    const sectionElement = element.closest("section")
    if (sectionElement) {
      const titleElement = sectionElement.querySelector(".section-title, h1, h2, h3")
      if (titleElement) {
        return titleElement.textContent.trim()
      }
    }
    return "General"
  }

  handleSearch(query) {
    if (!query || query.length < 2) {
      this.hideSearchResults()
      this.clearHighlights()
      return
    }

    this.isSearching = true
    this.currentResults = this.performSearch(query)
    this.displaySearchResults(this.currentResults, query)
    this.highlightResults(query)
  }

  performSearch(query) {
    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 1)
    const results = []

    this.searchData.forEach((item) => {
      let score = 0
      let matchCount = 0
      const itemText = item.text.toLowerCase()

      searchTerms.forEach((term) => {
        if (itemText.includes(term)) {
          matchCount++
          if (itemText === term) {
            score += item.weight * 3
          }
          else if (new RegExp(`\\b${term}\\b`).test(itemText)) {
            score += item.weight * 2
          }
          else {
            score += item.weight
          }
        }
      })

      if (matchCount > 0) {
        if (matchCount > 1) {
          score += matchCount * 2
        }

        results.push({
          ...item,
          score: score,
          matchCount: matchCount,
          relevance: (matchCount / searchTerms.length) * 100,
        })
      }
    })

    return results.sort((a, b) => b.score - a.score).slice(0, 10)
  }

  createSearchResultsContainer() {
    const container = document.createElement("div")
    container.className = "search-results-container"
    container.innerHTML = `
      <div class="search-results-header">
        <h3>Որոնման արդյունքներ</h3>
        <button class="search-close-btn">&times;</button>
      </div>
      <div class="search-results-content">
        <div class="search-results-list"></div>
      </div>
    `

    // Add styles
    const style = document.createElement("style")
    style.textContent = `
      .search-results-container {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-height: 400px;
        overflow-y: auto;
        display: none;
      }

      .search-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
      }

      .search-results-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #2e7d32;
      }

      .search-close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #757575;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .search-close-btn:hover {
        color: #2e7d32;
      }

      .search-results-list {
        padding: 10px 0;
      }

      .search-result-item {
        padding: 12px 20px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .search-result-item:hover {
        background-color: #f8f9fa;
      }

      .search-result-item:last-child {
        border-bottom: none;
      }

      .search-result-title {
        font-weight: 600;
        color: #2e7d32;
        margin-bottom: 4px;
        font-size: 0.95rem;
      }

      .search-result-text {
        color: #757575;
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 4px;
      }

      .search-result-meta {
        font-size: 0.8rem;
        color: #9e9e9e;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .search-result-section {
        font-style: italic;
      }

      .search-result-relevance {
        background: #e8f5e8;
        color: #2e7d32;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.7rem;
      }

      .search-highlight {
        background-color: #fff3cd;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
      }

      .no-results {
        padding: 30px 20px;
        text-align: center;
        color: #757575;
      }

      .no-results i {
        font-size: 2rem;
        margin-bottom: 10px;
        color: #e0e0e0;
      }

      @media (max-width: 768px) {
        .search-results-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          max-height: none;
          border-radius: 0;
          border: none;
        }
      }
    `

    document.head.appendChild(style)

    // Add to search boxes
    const searchBoxes = document.querySelectorAll(".search-box, .mobile-search")
    searchBoxes.forEach((box) => {
      box.style.position = "relative"
      box.appendChild(container.cloneNode(true))
    })

    // Bind close button events
    document.querySelectorAll(".search-close-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.hideSearchResults()
        this.clearHighlights()
      })
    })
  }

  displaySearchResults(results, query) {
    const containers = document.querySelectorAll(".search-results-container")

    containers.forEach((container) => {
      const resultsList = container.querySelector(".search-results-list")

      if (results.length === 0) {
        resultsList.innerHTML = `
          <div class="no-results">
            <i class="fas fa-search"></i>
            <p>Ոչինչ չգտնվեց "${query}" հարցման համար</p>
            <small>Փորձեք այլ բառեր կամ ստուգեք ուղղագրությունը</small>
          </div>
        `
      } else {
        resultsList.innerHTML = results
          .map((result) => {
            const highlightedText = this.highlightText(result.text, query)
            return `
            <div class="search-result-item" data-element-id="${result.id}">
              <div class="search-result-title">${result.type === "navigation" ? "Էջ" : "Բովանդակություն"}: ${result.section}</div>
              <div class="search-result-text">${highlightedText}</div>
              <div class="search-result-meta">
                <span class="search-result-section">${result.type}</span>
                <span class="search-result-relevance">${Math.round(result.relevance)}% համապատասխանություն</span>
              </div>
            </div>
          `
          })
          .join("")

        // Bind click events to results
        resultsList.querySelectorAll(".search-result-item").forEach((item) => {
          item.addEventListener("click", () => {
            const elementId = item.dataset.elementId
            const result = results.find((r) => r.id === elementId)
            if (result) {
              this.navigateToResult(result)
            }
          })
        })
      }

      container.style.display = "block"
    })
  }

  highlightText(text, query) {
    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 1)
    let highlightedText = text

    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi")
      highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>')
    })

    return highlightedText
  }

  highlightResults(query) {
    this.clearHighlights()

    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 1)

    this.currentResults.forEach((result) => {
      if (result.element && result.element.textContent) {
        const originalText = result.element.textContent
        let highlightedHTML = originalText

        searchTerms.forEach((term) => {
          const regex = new RegExp(`(${term})`, "gi")
          highlightedHTML = highlightedHTML.replace(regex, '<mark class="page-highlight">$1</mark>')
        })

        if (highlightedHTML !== originalText) {
          result.element.innerHTML = highlightedHTML
          result.element.classList.add("search-highlighted-element")
        }
      }
    })

    // Add page highlight styles
    if (!document.querySelector("#page-highlight-styles")) {
      const style = document.createElement("style")
      style.id = "page-highlight-styles"
      style.textContent = `
        .page-highlight {
          background-color: #ffeb3b;
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: 600;
          animation: highlight-pulse 2s ease-in-out;
        }

        @keyframes highlight-pulse {
          0% { background-color: #ffeb3b; }
          50% { background-color: #ffc107; }
          100% { background-color: #ffeb3b; }
        }

        .search-highlighted-element {
          position: relative;
        }
      `
      document.head.appendChild(style)
    }
  }

  clearHighlights() {
    // Remove page highlights
    document.querySelectorAll(".page-highlight").forEach((highlight) => {
      const parent = highlight.parentNode
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight)
      parent.normalize()
    })

    // Remove highlighted element classes
    document.querySelectorAll(".search-highlighted-element").forEach((element) => {
      element.classList.remove("search-highlighted-element")
    })
  }

  navigateToResult(result) {
    if (result.type === "navigation" && result.url && result.url !== window.location.pathname) {
      // Navigate to different page
      window.location.href = result.url
    } else if (result.element) {
      // Scroll to element on current page
      result.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      // Add temporary highlight
      result.element.style.transition = "all 0.3s ease"
      result.element.style.backgroundColor = "#e8f5e8"
      result.element.style.padding = "10px"
      result.element.style.borderRadius = "5px"

      setTimeout(() => {
        result.element.style.backgroundColor = ""
        result.element.style.padding = ""
        result.element.style.borderRadius = ""
      }, 2000)
    }

    this.hideSearchResults()
  }

  hideSearchResults() {
    document.querySelectorAll(".search-results-container").forEach((container) => {
      container.style.display = "none"
    })
  }
}

// Initialize search when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.universitySearch = new UniversitySearch()
})

// Handle page navigation for single-page applications
window.addEventListener("popstate", () => {
  if (window.universitySearch) {
    window.universitySearch.indexCurrentPage()
  }
})
