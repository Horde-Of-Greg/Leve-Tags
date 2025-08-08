
msg.reply({
  embed: {
    title: "How to use exposer subnet for oreproc",
    fields: [
      {
        name: "General idea",
        value: `This image gives the general flow of the filtering process for oreproc using exposers.
                The "filtered input" is the subnet is explained below.`,
      },
      {
        name: "How to make a subnet",
        value: `This picture explains the basic idea of how you make a subnet.

                If you put a quartz fiber (the little white thing) on an ME cable, that will only transfer power between the 2 two cables, but not items, or autocrafting signals. This allows you to separate your AE2 system into different nets. The net with your autocrafting, and the one that connects everywhere is your "main net". Everytime you branch off from it, you're making a subnet.

                Putting a storage bus on an interface allows "nets" to see each others' contents. If you put an interface in Net A, and a storage bus in Net B, Net B will be able to see all the items from Net A. If you filter the storage bus, the only items it will see will be the ones that fit the filter. Net A can be main net, but it also can be a subnet, and you would then make a "nested subnet" (although that makes things confusing so it's better to avoid).

                The filter in this image (\`ore*\`) should be changed to what you actually want to filter (you can use \`%t nfu_oredic\` for premade filters for steps of oreproc).`,
      },
      {
        name: "Practical example",
        value: `- White is main net. Connects to the multiblock for power, and the output using an ME output bus.
                - Pink is subnet. Is filtered elsewhere using the technique in Pic 3. Connects with an exposer to the input bus. (This can also be an ME stocking input bus, this is up to personal preference.)`,
      },
    ],
    image: {
      url: "https://media.discordapp.net/attachments/954620685848825886/1238782682108792902/image.png?ex=67ea5e46&is=67e90cc6&hm=b8f7e63426cb848e277533b785a9699ebd9c0053de2815c1d9999ca168637300&format=webp&quality=lossless&",
    },
    image: {
      url: "https://cdn.discordapp.com/attachments/954620685848825886/1355899957197930648/Oreproc-expl.png?ex=67ea9bbd&is=67e94a3d&hm=32115af63d9ddf520e1dba0b5cc87b63e86d0412d161b0ae4e0587cc447a098c&",
    },
    image: {
      url: "https://cdn.discordapp.com/attachments/954620685848825886/1355900404876972135/2024-06-11_15.png?ex=67ea9c27&is=67e94aa7&hm=b526072602a09d797d1853617432e39d904473504e7fe7b93372afa740301697&",
    },
  },
});
