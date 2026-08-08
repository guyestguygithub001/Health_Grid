
          function showClinicCategory(catId) {
            document.getElementById('clinicsCategoriesGrid').style.display = 'none';
            document.getElementById('clinicsUnitsContainer').style.display = 'block';
            
            // Hide all
            document.querySelectorAll('.clinic-category-units').forEach(el => el.style.display = 'none');
            
            // Show selected
            document.getElementById(catId).style.display = 'block';
            document.getElementById('clinicsSubtitle').style.display = 'none';
          }
          
          function showClinicsGrid() {
            document.getElementById('clinicsCategoriesGrid').style.display = 'grid';
            document.getElementById('clinicsUnitsContainer').style.display = 'none';
            document.getElementById('clinicsSubtitle').style.display = 'block';
          }
        