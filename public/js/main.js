(function ($) {
    "use strict";

    /*----------------------------
     jQuery MeanMenu
    ------------------------------ */
    jQuery('nav#dropdown').meanmenu({
        onePage: true
    });


    /*----------------------------
     wow js active
    ------------------------------ */
    new WOW().init();

    /*----------------------------
    One Page nav
    ------------------------------ */
    var top_offset = $('.logo-menu-area').height() - -70;  // get height of fixed navbar
    $('#nav').onePageNav({
        scrollOffset: top_offset,
        scrollSpeed: 750,
        easing: 'swing',
        currentClass: 'current',
    });

    /*----------------------------
     owl active
    ------------------------------ */

    // what happen
    $(".total-happen").owlCarousel({
        autoPlay: false,
        slideSpeed: 2000,
        pagination: false,
        navigation: false,
        items: 3,
        itemsDesktop: [1199, 3],
        itemsDesktopSmall: [980, 2],
        itemsTablet: [768, 2],
        itemsMobile: [765, 1],
    });

    // brand slider
    $(".total-brand").owlCarousel({
        autoPlay: false,
        slideSpeed: 2000,
        pagination: false,
        navigation: false,
        addClassActive: true,
        items: 6,
        itemsDesktop: [1199, 6],
        itemsDesktopSmall: [980, 5],
        itemsTablet: [768, 3],
        itemsMobile: [479, 2],
    });

    /*--------------------------
     scrollUp
    ---------------------------- */
    $.scrollUp({
        scrollText: "<i class='zmdi zmdi-arrow-merge'></i>",
        easingType: 'linear',
        scrollSpeed: 900,
        animation: 'fade'
    });
    /*----------------------------
     sticky menu 
    ------------------------------ */
    var s = $("#sticker");
    var pos = s.position();
    $(window).scroll(function () {
        var windowpos = $(window).scrollTop();
        if (windowpos >= pos.top) {
            s.addClass("stick");
        } else {
            s.removeClass("stick");
        }
    });
    /*--------------------------
     menu nav
    ---------------------------- */
    $('.shedule-head').on('click', function () {
        $('.panel').removeClass('active');
        $(this).parent('.panel').addClass('active');
    });

    /*--------------------------
    scroll down
    ---------------------------- */
    $(".see-demo-btn").on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#about-event").offset().top - 100
        }, 'slow');
    });

})(jQuery); 