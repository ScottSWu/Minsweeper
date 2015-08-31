module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        concat: {
            options: {
                sourceMap: true
            },
            build: {
                src: [
                    "src/Minsweeper.js",
                    "src/Board.js"
                ],
                dest: "build/Minsweeper.js"
            }
        }
    });
    
    var tasks = [ "concat" ];
    tasks.forEach(function (t) {
        grunt.loadNpmTasks("grunt-contrib-" + t);
    });
    
    grunt.registerTask("default", tasks);
}
