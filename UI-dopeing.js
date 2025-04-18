//script.js

// Utility function to populate a dropdown with styles
function populateDropdown(dropdown, jsonFile, inputName) {
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(styles => {
            const title = dropdown.querySelector('p');
            const fragment = document.createDocumentFragment();
            fragment.appendChild(title);

            styles.forEach((style, index) => {
                const radioContainer = document.createElement('div');
                radioContainer.className = 'radio-container';

                radioContainer.innerHTML = `
                <div class="one_line_div">
                    <input type="radio" 
                           id="${inputName}_${index}" 
                           name="${inputName}" 
                           value="${Number(index)}"
                           ${index === 0 ? 'checked' : ''}>
                    <label for="${inputName}_${index}">${style.name}</label>
                    </input>

                </div>
                    <br>`;

                fragment.appendChild(radioContainer);
            });

            dropdown.replaceChildren(fragment);
        })
        .catch(error => console.error(`Error loading ${inputName} styles:`, error));
}

// Select dropdown elements
const mapStylesDropdown = document.querySelector('.dropdown-content .dropbtn_grp .map_style');
const crosshairStylesDropdown = document.querySelector('.dropdown-content .dropbtn_grp .crosshair_style');


// Populate both dropdowns
populateDropdown(mapStylesDropdown, './json/map_styles.json', 'map_style');
populateDropdown(crosshairStylesDropdown, './json/crosshair.json', 'crosshair_style');

