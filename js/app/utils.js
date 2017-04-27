define({
  randInt: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
  },
  randNum: function(min, max) {
    return (Math.random() * (max - min)) + min;
  }
});
