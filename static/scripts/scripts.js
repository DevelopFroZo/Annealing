let socket = io()

$(document).ready( () => {

    $( "#mf" ).click( (e) => {
        let bt = $( "#mf" )

        if( bt.attr( "class" ) == "btn btn-secondary inputbt" ){
            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#ff" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", false )
        }
    } )

    $( "#ff" ).click( (e) => {
        let bt = $( "#ff" )

        if( bt.attr( "class" ) == "btn btn-secondary inputbt" ){
            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#mf" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", true )
        }
    } )

    $( '#stginp' ).change( (e) => {
        $( "#alert" ).find( "p" ).remove();
        $( "#alert" ).attr( "hidden", true )

        let tb = $( '#inputtb' )
        let size = $( '#stginp' ).val()
        
        if( size > 15 ){
            let bt = $( "#ff" )

            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#mf" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", true )
            $( '#stginp' ).val( 0 )
            return false
        }
        
        if( size < 2 ){
            $( "#alert" ).append( $( '<p>', {
                "text" : "Invalid matrix dimensions"
            } ) )
            $( "#alert" ).attr( "hidden", false )
            return false
        }

        tb.find( "tr" ).remove();
        let val = 0

        for( let i = 0; i < size; i++ ){
            let tr = $( "<tr>" );
            for( let j = 0; j < size; j++ ){
                let td = $( "<td>" );
                
                val = 0

                td.append( $( '<input>', {
                    "id" : i + "_" + j, 
                    "type" : "number",
                    "class" : "form-control inps",
                    "placeholder" : val,
                    "value" : val
                } ) )

                if( j == i ) td.find( "input" ).attr( "readonly", true )

                let input = td.find( "input" )
                input.change( (e) => {
                    let id = input.attr('id').split( "_" )
                    let newId = id[1] + "_" + id[0]
                    $( '#' + newId ).val( input.val() )
                } )

                tr.append( td )
            }
            tb.append( tr )
        }

        $( "#calculate" ).attr( "hidden", false )
        $( "#generate" ).attr( "hidden", false )
    } )

    $( "#calculate" ).click( (e) => {
        $( "#alert" ).find( "p" ).remove();
        $( "#alert" ).attr( "hidden", true )
        
        let tmin = parseInt( $( '#tmin' ).val() )
        if( tmin < 0 || isNaN( tmin ) ){
            $( "#alert" ).append( $( '<p>', {
                "text" : "Minimum temperature is not filled correctly"
            } ) )
            $( "#alert" ).attr( "hidden", false )
            return false
        }

        let tmax = parseInt( $( '#tmax' ).val() )
        if( tmax < 0 || isNaN( tmax ) ){
            $( "#alert" ).append( $( '<p>', {
                "text" : "Maximum temperature is not filled correctly"
            } ) )
            $( "#alert" ).attr( "hidden", false )
            return false
        }

        let n = parseInt( $( '#steps' ).val() )
        if( n < 1 || isNaN( n ) ){
            $( "#alert" ).append( $( '<p>', {
                "text" : "The number of steps is filled incorrectly"
            } ) )
            $( "#alert" ).attr( "hidden", false )
            return false
        }

        let size = $( '#stginp' ).val()
        let id

        let data = []

        for( let i = 0; i < size - 1; i++ ){
            let d = []
            for( let j = i + 1; j < size; j++ ){
                id = i + "_" + j
                let val = parseInt( $( "#" + id ).val() )
                
                if( val < 1 ){
                    $( "#alert" ).append( $( '<p>', {
                        "text" : "Weight cannot be less than zero"
                    } ) )
                    $( "#alert" ).attr( "hidden", false )
                    return false
                }

                d.push( val )
            }
            data.push( d ) 
        }

        socket.emit( "/api/annealing", JSON.stringify(
            {
                data,
                Tmin : tmin,
                Tmax : tmax,
                N : n,
            }
        ) )

        $( "#settings" ).attr( "hidden", true )
        $( "#graphs" ).attr( "hidden", false )

        let graph = new Graph( document.getElementById( "graph" ) )
        graph.drawPoints( size )

        let chart = new Chart( document.getElementById( "chart" ), getMaxSum( data ), n )

        socket.on( "/api/annealing", data => {
            const { event: e, path, pathLength, Ti, i } = JSON.parse( data ) 
    
            if( e === "init" ) chart.init( pathLength, i );
            if( e === "process" ){
                graph.drawLine( path )
                chart.drawLine( pathLength, i );
                $( "#temp" ).text( `Step: ${i}; Temp: ${Ti}` )
                $( "#path" ).text( `Path: ${path}; Length : ${pathLength}` )
            }    
    
            // console.log( data )
        } )
    } )

    $( "#recalculate" ).click( (e) => {
        calculate()
    } )

    $( "#settingsbt" ).click( (e) => {
        $( "#settings" ).attr( "hidden", false )
        $( "#graphs" ).attr( "hidden", true )

        $( "#graph" ).find( "svg" ).remove()
        $( "#chart" ).find( "svg" ).remove()
    } )

    $( "#generate" ).click( (e) => {
        let tb = $( '#inputtb' )
        let size = $( '#stginp' ).val()

        for( let i = 0; i < size - 1; i++ ){
            for( let j = i + 1; j < size; j++ ){
                let val = Math.floor( Math.random() * 10 ) + 1
                $( "#"+i+"_"+j ).val( val )
                $( "#"+j+"_"+i ).val( val )
            }
        }
    } )
} )

function calculate(){
    $( "#graph" ).find( "svg" ).remove()
    $( "#chart" ).find( "svg" ).remove()
    
    let tmin = parseInt( $( '#tmin' ).val() )
    let tmax = parseInt( $( '#tmax' ).val() )
    let n = parseInt( $( '#steps' ).val() )
    let size = $( '#stginp' ).val()
    let id

    let data = []

    for( let i = 0; i < size - 1; i++ ){
        let d = []
        for( let j = i + 1; j < size; j++ ){
            id = i + "_" + j
            let val = parseInt( $( "#" + id ).val() )
            
            if( val < 1 ){
                $( "#alert" ).append( $( '<p>', {
                    "text" : "Weight cannot be less than zero"
                } ) )
                $( "#alert" ).attr( "hidden", false )
                return false
            }

            d.push( val )
        }
        data.push( d ) 
    }

    console.log( data )

    socket.emit( "/api/annealing", JSON.stringify(
        {
            data,
            Tmin : tmin,
            Tmax : tmax,
            N : n,
        }
    ) )

    let graph = new Graph( document.getElementById( "graph" ) )
    graph.drawPoints( size )

    let chart = new Chart( document.getElementById( "chart" ), getMaxSum( data ), n )

    socket.on( "/api/annealing", data => {
        const { event: e, path, pathLength, Ti, i } = JSON.parse( data ) 

        if( e === "init" ) chart.init( pathLength, i );
        if( e === "process" ){
            graph.drawLine( path )
            chart.drawLine( pathLength, i );
            $( "#temp" ).text( `Step: ${i}; Temp: ${Ti}` )
            $( "#path" ).text( `Path: ${path}; Length : ${pathLength}` )
        }    

        // console.log( data )
    } )
}