let socket = io()
let file
let files

$(document).ready( () => {

    $( "#mf" ).click( (e) => {
        let bt = $( "#mf" )

        if( bt.attr( "class" ) == "btn btn-secondary inputbt" ){
            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#ff" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", false )
            $( '#inputfiles' ).attr( "hidden", true )
        }
    } )

    $( "#ff" ).click( async (e) => {
        let bt = $( "#ff" )
        $( "#alertf" ).find( "p" ).remove();
        $( "#alertf" ).attr( "hidden", true )

        if( bt.attr( "class" ) == "btn btn-secondary inputbt" ){
            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#mf" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", true )
            $( '#inputfiles' ).attr( "hidden", false )
        }

        let res = await fetch( "/files" )

        if( res.status == 204 ){
            $( "#alertf" ).append( $( '<p>', {
                "text" : "File not found, upload your"
            } ) )
            $( "#alertf" ).attr( "hidden", false )
        } else {
            files = []
            $( "#fileselect" ).find( "option" ).remove();
            files = (await res.json()).files

            $( "#fileselect" ).attr( "hidden", false )

            for( let file of files ){
                $( "#fileselect" ).append( $( '<option>' , {
                    "value" : file,
                    "text" : file
                } ) )
            }

            $( "#selectfile" ).attr( "hidden", false )
        }
    } )

    $( "#inputGroupFile01" ).change( (e) => {
        document.getElementById( "inputGroupFile01label" ).innerHTML = e.target.files[0].name 
        file = e.target.files[0]
    } )

    $( "#fileupload" ).click( async e => {
        $( "#alertf" ).find( "p" ).remove();
        $( "#alertf" ).attr( "hidden", true )

        for( let f of files ){
            if( f == file.name ){
                $( "#alertf" ).append( $( '<p>', {
                    "text" : "File already exists"
                } ) )
                $( "#alertf" ).attr( "hidden", false )
                return false
            }
        }

        let body = new FormData()

        body.append( "file", file )
        body.append( "rewrite", true )

        let res = await fetch( "/upload", {
            method : "POST",
            body
        } )

        if( res.status !== 204 ){
            console.log( await res.json() )
        }

        console.log( res )

        $( "#ff" ).click()
    } )

    $( "#recalculatef" ).click( () => {
        $( "#calculatef" ).click()  
    } )

    $( "#settingsbtf" ).click( () => {
        $( "#settings" ).attr( "hidden", false )
        $( "#graphsf" ).attr( "hidden", true )

        $( "#graphf" ).find( "svg" ).remove()
    } )

    $( "#calculatef" ).click( async e => {
        $( "#graphvf" ).click()  
        $( "#graphf" ).find( "svg" ).remove()
        $( "#minpaths" ).find( "svg" ).remove()
        $( "#minpathlengths" ).find( "svg" ).remove()
        $( "#graphsf" ).attr( "hidden", true )

        file = $( "#fileselect" ).val()
        let tmin = $( "#tminf" ).val()
        let tmax = $( "#tmaxf" ).val()
        let mode = $( "#modef" ).val()
        let n = $( "#stepsf" ).val()
        let k = $( "#startsf" ).val()
        let saveMinimumState = $( "#saveMinimumStatef" ).is(':checked')
        let suffleCount = $( "#shufflecountf" ).val()

        // console.log( file, tmin, tmax, mode, n, k, saveMinimumState, suffleCount, `/annealing?file=${file}&Tmin=${tmin}&Tmax=${tmax}&mode=${mode}&N=${n}&k=${k}&saveMinimumState=${saveMinimumState}%shuffleCount=${suffleCount}` )

        $( "#settings" ).attr( "hidden", true )
        $( "#preloader" ).animate( {
            opacity : 1
        }, 200 )

        let res = await fetch( `/annealing?file=${file}&Tmin=${tmin}&Tmax=${tmax}&mode=${mode}&N=${n}&k=${k}&saveMinimumState=${saveMinimumState}&shuffleCount=${suffleCount}` )

        let result = await res.json()

        $( "#preloader" ).animate( {
            opacity : 0
        }, 200 )
        console.log( result )

        $( "#graphsf" ).attr( "hidden", false )
        $( "#chartsfd" ).attr( "hidden", false )

        let graph = new Graph( document.getElementById( "graphf" ) )
        graph.drawPoints( result.minPath.length )
        graph.drawLine( result.minPath )
        $( "#pathf" ).text( `Path: ${result.minPathLength}` )

        if( result.allMinPaths.length > 1 ){
            $( "#minpathsH" ).attr( "hidden", false );
            $( "#minpaths" ).attr( "hidden", false );
            let minPaths = new Chart2( document.getElementById( "minpaths" ) )
            minPaths.draw( result.allMinPaths )
        } else {
            $( "#minpathsH" ).attr( "hidden", true );
            $( "#minpaths" ).attr( "hidden", true );
        }

        let minpathlengths = new Chart2( document.getElementById( "minpathlengths" ) )
        minpathlengths.draw( result.minPathLengths )

        $( "#chartsfd" ).attr( "hidden", true )
    } )

    $( "#charts" ).click( e => {
        $( "#graphfd" ).attr( "hidden", true )
        $( "#charts" ).attr( "hidden", true )
        $( "#graphvf" ).attr( "hidden", false )
        $( "#chartsfd" ).attr( "hidden", false )
    } )

    $( "#graphvf" ).click( e => {
        $( "#chartsfd" ).attr( "hidden", true )
        $( "#graphvf" ).attr( "hidden", true )
        $( "#charts" ).attr( "hidden", false )
        $( "#graphfd" ).attr( "hidden", false )    
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