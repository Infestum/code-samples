<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Komondor\Common\Exceptions\ValidationException;

class SetCollectionCompanyId extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collection-company:set
                            { --class= : Full class name e.g. App\Book. Required.}
                            { --companyId= : Company id to set to item(s).  Required.}
                            { --id= : Item where to change company. Optional.}
                            { --whereCompanyId= : Use for company id swap. Optional.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set item(s) company id';

    protected $rules = [
        'companyId' => 'required|integer|min:0',
        'class' => 'required|class_exist|uses_company_trait',
        'whereCompanyId' => 'integer|min:0'
    ];

    const companyTrait = 'Komondor\Common\Models\CompanyTrait';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

        Validator::extend('class_exist', function($attribute, $value) {
            return class_exists($value);
        });

        Validator::extend('uses_company_trait', function($attribute, $value) {
            $traits = class_uses($value);

            return in_array(static::companyTrait, $traits);
        });
    }

    protected function validate ()
    {

        $fields = [
            'companyId' => $this->companyId,
            'class' => $this->class,
            'whereCompanyId' => $this->whereCompanyId
        ];

        $messages = [
            'class_exist' => 'The :attribute doesn\'t exist',
            'uses_company_trait' => 'Class needs to use trait called '. static::companyTrait
        ];

        $validator = Validator::make($fields, $this->rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator->messages()->toArray());
        }
    }

    protected function getConfirmMessage() {
        $message = "You are about to change company for all {$this->class}s";

        if ($this->whereCompanyId) {
            $message .= " where company id equals {$this->whereCompanyId}";
        }

        $message .= '. Do you wish to continue? [y|N]';

        return $message;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->class =  $this->option('class');
        $this->id = (integer) $this->option('id');
        $this->companyId = $this->option('companyId');
        $this->whereCompanyId = $this->option('whereCompanyId');

        $this->validate();

        // Set company for all items if id is not specified
        if (!$this->id && !$this->confirm($this->getConfirmMessage())) {
            return;
        }

        // Update where id > 0 (for all) or where id = $id
        $sign = $this->id ? '=' : '>';
        $item = new $this->class;

        $query = $item::withoutGlobalScopes()
            ->where('id', $sign, $this->id);

        if ($this->whereCompanyId) {
            $query = $query->where('company_id', $this->whereCompanyId);
        }

        $query->update(['company_id' => $this->companyId ]);

        $message = 'Company id has been successfully changed to '.  $this->companyId .' ';
        $message .= 'for '.($this->id ? "{$this->class}#{$this->id}": "all {$this->class}s");

        $this->info($message);
    }
}