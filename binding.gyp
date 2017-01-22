{
  'targets': [
    {
      'target_name': 'registers',
      'conditions': [
        ['OS=="linux"', {
          'sources': [
            'src/Registers.cpp'
          ]
        }]
      ],
      "include_dirs" : [
            "<!(node -e \"require('nan')\")"
        ]
    }
  ]
}
