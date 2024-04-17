  const infoItems = document.querySelectorAll('#info-list ul li');

  // Добавляем обработчик события для каждого элемента информации
  infoItems.forEach(item => {
    item.addEventListener('click', () => {
      // Убираем класс 'active-info' у всех элементов информации
      infoItems.forEach(item => {
        item.classList.remove('active-info');
      });

      // Добавляем класс 'active-info' только к текущему элементу информации
      item.classList.add('active-info');

      // Получаем id информации, на которую было нажато
      const infoId = item.getAttribute('data-info');
      // Скрываем все элементы информации
      document.querySelectorAll('.info-item').forEach(info => {
        info.classList.remove('active-info');
      });
      // Отображаем только активный элемент информации
      document.getElementById(infoId).classList.add('active-info');
    });
  });

  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("navbarDropdown").addEventListener("click", function() {
      var myModal = new bootstrap.Modal(document.getElementById('myModal'), {
        keyboard: false
      });
      myModal.show();
    });
  });

  $(document).ready(function(){
    // Предотвращаем стандартное действие ссылок при клике на них
    $('.modal-link').click(function(e){
      e.preventDefault();
      var url = $(this).attr('href');
      window.open(url, '_blank');
    });
  });
