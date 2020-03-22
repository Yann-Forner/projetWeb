
$( document ).ready(function() {
    $('#addNeed').click(function () {
        $('#myType').val('besoin');
        $('#titleModalAddExchange').text('Ajout d\'un besoin');
    });
    $('#addSurplus').click(function () {
        $('#myType').val('surplus');
        $('#titleModalAddExchange').text('Ajout d\'un surplus');
    });

});

