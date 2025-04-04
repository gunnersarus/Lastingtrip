$(document).ready(function () {
  // var hotelId1 = localStorage.getItem("hotelId");
  var url = window.location.pathname;
  var hotelId1 = url.substring(url.lastIndexOf("/") + 1);
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  function renderPage() {
    $.ajax({
      url: "/api/v1/hotelAmenities/" + hotelId1,
      method: "GET",
      success: function (data) {
        console.log(data);
        fetch("/api/v1/amenities?type=0")
          .then((response) => response.json())
          .then((data1) => {
            const amenities1 = data1;
            console.log(amenities1);
            // Lấy danh sách các amenities từ API và lưu vào biến
            const amenities = amenities1;

            var tableHtml = "";
            data.forEach(function (service, index) {
              // Tạo HTML cho từng hàng trong bảng
              tableHtml += "<tr>";
              tableHtml += "<td>" + (index + 1) + "</td>";

              // Parse the JSON string to convert it to an array or object
              if (Array.isArray(amenities)) {
                // If amenities is an array, loop through and append each amenity to <td>
                amenities.forEach(function (amenity) {
                  console.log(amenity.id);
                  if (amenity.id == service.amenityId) {
                    tableHtml += "<td>" + amenity.name + "</td>";
                  }
                });
              }

              tableHtml += "<td>";
              tableHtml +=
                '<button type="button" class="updateService" value="' +
                service.id +
                '">Chỉnh sửa</button>';
              tableHtml +=
                '<button type="button" class="deleteService" value="' +
                service.id +
                '">Xóa</button>';
              tableHtml += "</td>";
              tableHtml += "</tr>";
            });

            // Render dữ liệu vào bảng
            $(".room-table table tbody").html(tableHtml);
          })
          .catch((error) => {
            console.error("Lỗi khi gọi API:", error);
          });
      },
      error: function (xhr, status, error) {
        console.error(error);
        console.log("Lỗi khi render page room");
      },
    });
  }
  renderPage();
  async function ServiceHotel() {
    try {
      // Make AJAX request to fetch data
      const response = await $.ajax({
        url: "/api/v1/amenities?type=0", // Assuming you want to fetch amenities of type 0
        method: "GET",
      });

      // Assuming 'response' contains the data fetched from the server
      const options = JSON.stringify(response);

      // Store the options array in localStorage with the key 'Service'
      localStorage.setItem("Service", options);

      console.log("Data successfully stored in localStorage:", options);
    } catch (error) {
      console.error("Error fetching or storing data:", error);
    }
  }
  $(".service-search-btn").on("click", function () {
    var selectElement = $("#service-hotel"); // Assuming this is the <select> element
    selectElement.empty(); // Clear existing options

    try {
      const optionsJSON = localStorage.getItem("Service"); // Retrieve options as JSON string from localStorage
      const options = JSON.parse(optionsJSON); // Parse the JSON string to convert it to an array or object

      if (Array.isArray(options)) {
        // If options is an array, loop through and append each option to <select>
        options.forEach(function (option) {
          selectElement.append(
            $("<option>", {
              value: option.id,
              text: option.name,
            })
          );
        });

        // Event listener for selecting an option
        selectElement.on("change", function () {
          const selectedOptionId = $(this).val(); // Get the selected option's ID
          const hotelId = localStorage.getItem("hotelId"); // Retrieve the hotel ID from localStorage

          if (selectedOptionId && hotelId) {
            console.log("Selected Service ID:", selectedOptionId);
            console.log("Hotel ID:", hotelId);
          } else {
            console.error("Invalid option or hotel ID.");
          }
        });
      } else {
        console.error("Invalid data retrieved from localStorage:", options);
      }
    } catch (error) {
      console.error(
        "Error parsing or retrieving data from localStorage:",
        error
      );
    }
  });

  // Event listener for "Thêm mới" button click
  $(".dkbutton").on("click", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const selectedOptionId = $("#service-hotel").val(); // Get the selected option's ID
    const hotelId = localStorage.getItem("hotelId"); // Retrieve the hotel ID from localStorage

    if (selectedOptionId && hotelId) {
      console.log("Creating new service...");
      const data = {
        amenityId: selectedOptionId,
        hotelId: hotelId,
        // Add other necessary data properties for the create operation
      };

      // Perform AJAX request to create the service
      $.ajax({
        url: "/api/v1/hotelAmenities", // Adjust the URL endpoint
        method: "POST",
      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
        data: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        success: function (response) {
          console.log("Service created successfully:", response);
          // Optionally, perform additional actions after successful creation
          // alert("Service created successfully!");

          $(".custom-popup-overlay").hide();
          $(".custom-popup").hide();
          renderPage();
        },
        error: function (error) {
          console.error("Error creating service:", error);
          alert("Error creating service. Please try again.");
        },
      });
    } else {
      console.error("Invalid option or hotel ID.");
      alert("Invalid option or hotel ID. Please make a valid selection.");
    }
  });

  // Function to perform the create operation
  ServiceHotel();
  // Sự kiện khi click vào nút "Thêm"
  $(".room-search-create").click(function () {
    $(".custom-popup-overlay").show();
    $(".custom-popup").show();
  });
  // Sự kiện khi click vào nút "Đóng" trong popup
  $(".custom-close-btn").click(function () {
    $(".custom-popup-overlay").hide();
    $(".custom-popup").hide();
  });

  // Sự kiện khi click vào nút "Đóng" trong popup thông báo xóa
  $(".close-btn1").click(function () {
    $(".popup-overlay-delete").hide();
    $(".popup-delete").hide();
  });
  $(document).on("click", ".close-btn", function () {
    $(".popup-overlay").hide();
    $(".popup").hide();
  });
  // Bắt sự kiện click vào button hoặc nút mở popup
  $(document).on("click", ".deleteService", function () {
    let id = $(this).val();

    // Hiển thị hộp thoại xác nhận xóa
    $(".popup-overlay-delete").show();
    $(".popup-delete").show();

    // Lưu ID người dùng vào một thuộc tính data để sử dụng sau này
    $(".popup-delete").attr("data-id", id);
  });

  // Sự kiện khi người dùng xác nhận xóa
  $(".confirm-delete").click(function () {
    // Lấy ID người dùng từ thuộc tính data
    let id = $(".popup-delete").attr("data-id");
    // Gửi yêu cầu xóa người dùng
    $.ajax({
      url: `/api/v1/hotelAmenities/${id}`,
      method: "DELETE",
      
      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
      success: function (data) {
        $(".popup-overlay-delete").hide();
        $(".popup-delete").hide();
        renderPage();
      },
      error: function (error) {
        console.log("Lỗi khi xóa người dùng", error);
      },
    });
  });

  // Sự kiện khi người dùng hủy việc xóa
  $(".cancel-delete").click(function () {
    $(".popup-overlay-delete").hide();
    $(".popup-delete").hide();
  });

  // Sự kiện khi click vào nút "Sửa"
  $(document).on("click", ".updateService", function () {
    var id = $(this).val();
    console.log(id);
    $(".popup-overlay").show();

    // Send request to fetch service details
    $.ajax({
      url: `/api/v1/hotelAmenities/amenities/${id}`,
      method: "GET",
      success: function (data) {
        console.log(data);

        // Retrieve options from localStorage
        const optionsJSON = localStorage.getItem("Service");
        const options = JSON.parse(optionsJSON);

        // Find the corresponding service option based on amenityId
        let currentServiceName;
        if (Array.isArray(options)) {
          const matchedOption = options.find(
            (option) => option.id == data[0].amenityId
          );
          console.log("Matched option:", matchedOption);
          if (matchedOption) {
            currentServiceName = matchedOption.name;
          }
        }

        // Generate and display the popup overlay with update form
        const popupContent = `
        <div class="popup"> 
            <span class="close-btn">&times;</span> 
            <h2>Chỉnh sửa</h2> 
            <form id="updateForm"> 
                <select id="serviceDropdown" name="serviceDropdown">
                    ${options
                      .map(
                        (option) =>
                          `<option value="${option.id}">${option.name}</option>`
                      )
                      .join("")}
                </select>
                <div class="ebutton"> 
                    <input type="submit" value="Cập nhật"> 
                </div> 
            </form> 
        </div>
    `;

        $(".popup-overlay").html(popupContent);
        // Set the initial selected option in the dropdown
        $("#serviceDropdown").val(data[0].amenityId); // Set the value to the current amenityId

        // Handle dropdown change event to update the input field value
        $("#serviceDropdown").change(function () {
          const selectedOptionId = $(this).val();
          $(".ebutton").val(data[0].id);
          console.log(data[0].id);
          const selectedOption = options.find(
            (option) => option.id === parseInt(selectedOptionId)
          );
          if (selectedOption) {
            $("#name").val(selectedOption.name); // Update the input field with the selected service name
          }
          console.log($("#serviceDropdown").val());
        });

        $(".ebutton").click(function () {
          const id = $(".updateService").val();
          const hotelId = localStorage.getItem("hotelId");
          const amenityId = $("#serviceDropdown").val();

          // Kiểm tra các giá trị cần thiết trước khi gửi yêu cầu AJAX
          if (!hotelId || !amenityId) {
            console.log("Id:", id);
            console.log("HotelId:", hotelId);
            console.log("AmenityId:", amenityId);
            alert("Vui lòng chọn đầy đủ thông tin trước khi cập nhật.");
            return; // Ngăn chặn việc gửi yêu cầu nếu dữ liệu không hợp lệ
          }

          // Gửi yêu cầu AJAX khi dữ liệu đầu vào hợp lệ
          $.ajax({
            url: `/api/v1/hotelAmenities/` + id,
            method: "PUT",
      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
            contentType: "application/json",
            data: JSON.stringify({
              hotelId: hotelId,
              amenityId: amenityId,
            }),
            success: function (data) {
              console.log(data);
              alert("Chỉnh sửa dịch vụ thành công");
            },
            error: function (error) {
              console.error("Lỗi khi chỉnh sửa dịch vụ:", error);
              alert("Lỗi khi chỉnh sửa dịch vụ");
            },
          });
        });
      },
    });
  });

  // JavaScript to show the modal
  // Event listener for close button

  // Example: Open the modal when clicking a button

  // Hàm để render lại danh sách ảnh sau khi thực hiện thay đổi
  function renderImages() {
    // Gọi lại hàm renderPage để cập nhật trang
    renderPage(); // Giả sử renderPage() là hàm để load lại danh sách người dùng
  }
});
// Hàm hiển thị xem trước các tệp đã chọn
